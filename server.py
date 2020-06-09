"""Server for chicken tinder app."""

from flask import (Flask, render_template, request,
                   flash, session, redirect, jsonify)
from model import connect_to_db
import model
import crud 
# comment out if just testing crud | there is a circulate dependency
import os
import requests

from jinja2 import StrictUndefined

app = Flask(__name__)
app.secret_key = "dev"
app.jinja_env.undefined = StrictUndefined

# This configuration option makes the Flask interactive debugger
# more useful (you should remove this line in production though)
app.config['PRESERVE_CONTEXT_ON_EXCEPTION'] = True


@app.route('/')
def homepage():
    """Show homepage. Search for list of business"""

    return render_template('homepage.html')


@app.route('/search', methods=['POST'])
def search_business():
    term = request.form.get("find")
    location = request.form.get("near")
    max_business = request.form.get("max-business")
    # TO DO LATER
    # sort = request.form.get("sort-by")
    # price_range = request.form.get("price")
    # open_now = request.form.get("open-now")

    # validation
    if max_business is None:
        max_business = 20

    search = crud.search_yelp(term, location, max_business)

    flash(f'URL: http://localhost:5000/room/{search}')

    return redirect('/')


@app.route('/room/<uuid>')
def room(uuid):

    return render_template('room.html', uuid=uuid)

@app.route('/liking/<uuid>', methods=['POST'])
def show_businesses(uuid):
    name = request.form.get("name")
    # uuid = request.form.get("room-id")
    search_id = crud.get_search_id_from_uuid(uuid)

    user = crud.create_user(name, search_id)
    
    list_business = crud.get_businesslist_search_id(search_id)
    session['user_id'] = user.id

    return render_template('like.html', list_business=list_business, uuid=uuid)

# TO DO - GET LIKE FOR EACH BUSINESS STORE IN DATABASE#
@app.route('/show/<uuid>', methods=['POST'])
def get_likes(uuid):

    search_id = crud.get_search_id_from_uuid(uuid)
    list_business = crud.get_businesslist_search_id(search_id)
    user_id = session['user_id']

    #like all the businesses
    for business in list_business:
        liked_str = request.form.get(str(business.id))
        if liked_str == "True":
            liked = True
        else:
            liked = False
        crud.create_likes(user_id, business.id, liked) 

    return render_template('show_completes.html', uuid=uuid)

@app.route('/api/completes/<uuid>')
def api_completes(uuid):
    search_id = crud.get_search_id_from_uuid(uuid)
    num_completes = crud.count_completes(search_id) 

    return str(num_completes)
    

@app.route('/api/results/<uuid>')
def api_results(uuid):

    search_id = crud.get_search_id_from_uuid(uuid)

    num_completes = crud.count_completes(search_id)
    dict_business_likes = crud.return_matches(search_id)

    #create a list that match return business id of matches
    matches = []

    for business, likes in dict_business_likes.items():
        if likes == num_completes:
            matches.append(business)

    #return business info on matches
    matches_business_info = []

    for business in matches:
        bus_info = crud.get_business_by_business_id(business)
        matches_business_info.append(bus_info)

    return jsonify(matches)

if __name__ == '__main__':
    connect_to_db(app)
    app.run(host='0.0.0.0', debug=True)
