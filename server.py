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

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def show_app(path):

    return render_template('index.html')


@app.route('/api/search', methods=['POST'])
def search_business():
    """create yelp business search - PAGE 1"""
    data = request.json
    term = data["find"]
    location = data["near"]
    max_business = data["numsearch"]
    print( term, location, max_business)
    # TO DO LATER
    # sort = request.form.get("sort-by")
    # price_range = request.form.get("price")
    # open_now = request.form.get("open-now")

    if max_business is None:
        max_business = 20

    search = crud.search_yelp(term, location, max_business)

    return jsonify(search)


@app.route('/api/createuser', methods=['POST'])
def create_user():
    """create an user in the database - PAGE 2"""
    data = request.json
    uuid = data["uuid"]
    name = data["name"]
    
    search_id = crud.get_search_id_from_uuid(uuid)
    
    user = crud.create_user(name, search_id)
    # session['user_id'] = user.id


    # print(user.toDict())
    return jsonify(user.toDict())


@app.route('/api/bus/<uuid>', methods=['GET'])
def return_businesses(uuid):
    """"provide a list of business with all the info based on the search - PAGE 3"""
    search_id = crud.get_search_id_from_uuid(uuid)
    list_business_obj = crud.get_businesslist_search_id(search_id)

    list_business_dict = []

    for bus in list_business_obj:
        list_business_dict.append(bus.toDict())

    # print(list_business_dict)

    return jsonify(list_business_dict)


@app.route('/api/user/<user_id>', methods=['GET'])
def check_user_status(user_id):
    """chcek to see if user has completed"""

    user = crud.get_user(user_id)

    return jsonify(user.toDict())


@app.route('/api/createlove/<user_id>', methods=['POST'])
def create_likes(user_id):
    """save like/dislike (love/nope) a business into db - PAGE 3"""
    data = request.json
    uuid = data["uuid"]
    business_id = data["busid"]
    love = bool(data["love"])
    
    search_id = crud.get_search_id_from_uuid(uuid)

    bus_liked = crud.create_likes(user_id, business_id, love) 

    # update to create better return
    return jsonify('success')


@app.route('/api/user_completed/<user_id>', methods=['POST'])
def update_completed(user_id):
    """updated db once the user has completed"""

    user_completed = crud.update_user_completed(user_id)

    print (f'UPDATE COMPLETE STATUS: {user_completed.toDict()}')
    return jsonify(user_completed.toDict())


@app.route('/api/completes/<uuid>', methods=['GET'])
def api_completes(uuid):
    """return how many people have completed that room/uuid"""
    search_id = crud.get_search_id_from_uuid(uuid)
    num_completes = crud.count_completes(search_id) 

    return jsonify(str(num_completes))
    

@app.route('/api/results/<uuid>', methods=['GET'])
def api_results(uuid):
    """return a dictionary of business and it's likes"""
    search_id = crud.get_search_id_from_uuid(uuid)
    dict_business_likes = crud.return_matches(search_id)

    return jsonify(dict_business_likes)


if __name__ == '__main__':
    connect_to_db(app)
    app.run(host='0.0.0.0', debug=True)