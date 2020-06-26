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

GOOGLE_KEY = os.environ['GOOGLE_KEY']

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
    price_range = data["pricerange"]
    open_now = data["isopennow"]
    sort_by = data["sortby"]
    print(term, location, max_business, price_range, open_now, sort_by)

    if max_business is None:
        max_business = 10

    search = crud.search_yelp(
        term, location, max_business, price_range, open_now, sort_by)

    return jsonify(search)


@app.route('/api/createuser', methods=['POST'])
def create_user():
    """create an user in the database - PAGE 2"""
    data = request.json
    short_code = data["roomid"]
    name = data["name"]

    if crud.short_code_valid(short_code):
        search_id = crud.get_search_id_from_shortcode(short_code)
        if crud.user_exist(name, search_id):
            return jsonify('User already exist, please pick a different name.'), 400
        else:
            user = crud.create_user(name, search_id)
            return jsonify(user.todict())
    else:
        return jsonify('Invalid room code, please enter a valid room code.'), 400


@app.route('/api/bus/<roomid>', methods=['GET'])
def return_businesses(roomid):
    """"provide a list of business with all the info based on the search - PAGE 3"""
    search_id = crud.get_search_id_from_shortcode(roomid)
    list_business_obj = crud.get_businesslist_search_id(search_id)

    list_business_dict = []

    for bus in list_business_obj:
        list_business_dict.append(bus.todict())

    return jsonify(list_business_dict)


@app.route('/api/user/<user_id>', methods=['GET'])
def check_user_status(user_id):
    """chcek to see if user has completed"""

    user = crud.get_user(user_id)

    return jsonify(user.todict())


@app.route('/api/createlove/<user_id>', methods=['POST'])
def create_likes(user_id):
    """save like/dislike (love/nope) a business into db - PAGE 3"""
    data = request.json
    short_code = data["roomid"]
    business_id = data["busid"]
    love = bool(data["love"])

    search_id = crud.get_search_id_from_shortcode(short_code)

    bus_liked = crud.create_likes(user_id, business_id, love)

    return jsonify(bus_liked.todict())


@app.route('/api/user_completed/<user_id>', methods=['POST'])
def update_completed(user_id):
    """updated db once the user has completed"""

    user_completed = crud.update_user_completed(user_id)

    print(f'UPDATE COMPLETE STATUS: {user_completed.todict()}')
    return jsonify(user_completed.todict())


@app.route('/api/completes/<roomid>', methods=['GET'])
def api_completes(roomid):
    """return how many people have completed that room/uuid"""
    search_id = crud.get_search_id_from_shortcode(roomid)
    num_completes = crud.count_completes(search_id)

    return jsonify(str(num_completes))


@app.route('/api/results/<roomid>', methods=['GET'])
def api_results(roomid):
    """return a dictionary of business and it's likes"""
    search_id = crud.get_search_id_from_shortcode(roomid)
    dict_business_likes = crud.return_matches(search_id)

    return jsonify(dict_business_likes)


@app.route('/api/reverse_geolocation', methods=['POST'])
def reverse_geolocation():
    """return formated address"""
    data = request.json
    lng = str(data["lng"])
    lat = str(data["lat"])

    # GOOGLE API to get formated addrees
    url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + \
        lat + "," + lng + "&key=" + GOOGLE_KEY

    payload = {}
    headers = {}

    response = requests.get(url, headers=headers, data=payload)
    results = response.json()
    address = results['results'][0]['formatted_address']
    return(jsonify(address))


if __name__ == '__main__':
    connect_to_db(app)
    app.run(host='0.0.0.0', debug=True)
