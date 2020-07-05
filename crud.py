"""CRUD operations."""

from model import db, Search, User, Like, Business, SearchBusiness, connect_to_db, ShortCode
import requests
import json
import uuid
import os
from datetime import datetime, timedelta
from itertools import permutations
from random import shuffle

API_KEY = os.environ['YELP_KEY']


def create_shortcodes():
    """create all shortcode"""

    letters = "ABFJNP"
    lst_code = list(permutations(letters, 4))
    shuffle(lst_code)
    bad = {'ANAL', 'ANUS', 'ARSE', 'CLIT', 'COCK',
           'CRAP', 'CUNT', 'DICK', 'DUMB', 'DYKE',
           'FUCK', 'GOOK', 'HOMO', 'HOES', 'JERK',
           'JISM', 'JIZZ', 'JUGS', 'KIKE', 'PAKI',
           'PISS', 'SCUM', 'SHAG', 'SHIT', 'SLAG',
           'SLUT', 'SPIC', 'SUCK', 'TITS', 'TURD',
           'TWAT', 'WANK'}

    for i in lst_code:
        code_str = ''.join(i)
        if code_str not in bad:
            code = ShortCode(short_code=code_str)
            db.session.add(code)
    db.session.commit()


def create_search(num_search=20, price_range=None):
    """creata a search."""

    uuid_num = uuid.uuid4()

    search = Search(uuid=uuid_num, num_search=num_search,
                    price_range=price_range)
    db.session.add(search)
    db.session.commit()

    return search


def add_shortcode(search_id):

    short_code = ShortCode.query.filter(ShortCode.search_id == None).first()
    if short_code == None:
        short_code = ShortCode.query.order_by(ShortCode.date_added).first()
    short_code.search_id = search_id
    short_code.date_added = datetime.now()
    db.session.commit()

    return short_code


def create_business(yelp_id, yelp_alias, name, image_url, url, review_count, rating, price, categories, distance, display_address):
    """creata a business with yelp details."""

    business = Business(yelp_id=yelp_id, yelp_alias=yelp_alias, name=name,
                        image_url=image_url, url=url, review_count=review_count, rating=rating, price=price, categories=categories, distance=distance, display_address=display_address)
    db.session.add(business)
    db.session.commit()

    return business


def create_user(name, search_id):
    """creata a user."""

    user = User(name=name, completed=False, search_id=search_id)
    db.session.add(user)
    db.session.commit()

    return user


def update_user_completed(user_id):
    """update status of user completed."""

    user = User.query.get(user_id)
    user.completed = True
    db.session.commit()

    return user


def get_user(user_id):
    """get user by id"""

    return User.query.get(user_id)


def create_search_business(search_id, business_id):
    """creata a search_business connection."""

    search_business = SearchBusiness(
        search_id=search_id, business_id=business_id)
    db.session.add(search_business)
    db.session.commit()

    return search_business


def create_likes(user_id, business_id, liking):
    """liking a business"""

    # check if busid and userid exist
    likes = Like.query.filter(Like.user_id == user_id,
                              Like.business_id == business_id).first()

    if likes is None:
        likes = Like(user_id=user_id, business_id=business_id, liking=liking)
        db.session.add(likes)
    else:
        likes.liking = liking
    db.session.commit()

    return likes


def get_business_by_yelp_id(yelp_id):
    """get business with yelp id."""

    return Business.query.filter(Business.yelp_id == yelp_id).first()


def get_business_by_business_id(business_id):

    return Business.query.get(business_id)


def get_search_id_from_uuid(uuid):
    """get search id with uui."""

    search = Search.query.filter_by(uuid=uuid).first()

    return search.id


def get_search_id_from_shortcode(short_code):
    """get search id with short code."""

    short_code_search = ShortCode.query.filter_by(
        short_code=short_code).first()

    return short_code_search.search_id


def get_businesslist_search_id(search_id):
    """get all businesses with search id"""

    bus_list_by_id = SearchBusiness.query.filter_by(search_id=search_id).all()

    bus_list_obj = []

    for business in bus_list_by_id:
        bus = Business.query.get(business.business_id)
        bus_list_obj.append(bus)

    return bus_list_obj


def search_yelp(term, location, num_search=10, price_range=None, open_now=False, sort_by=None):
    """Search yelp with the params, 
    creaste search, goes throup API, 
    create business if not exist, 
    create connection bewteen search & business"""

    # CREATE A Search
    search = create_search(num_search, price_range)
    short_code = add_shortcode(search.id)

    # YELP API to gather business list and store into businesses database
    url = "https://api.yelp.com/v3/businesses/search"
    payload = {'term': term, 'location': location,
               'limit': num_search, 'open_now': open_now, }
    if price_range:
        payload["price"] = ",".join(map(str, price_range))
    if sort_by:
        payload["sort_by"] = sort_by
    key = f"Bearer {API_KEY}"

    req = requests.get(url, headers={
                       'Authorization': key}, params=payload)

    business_results = req.json()

    for business in business_results['businesses']:
        # if yelp.id is not in database create / then create connection
        if get_business_by_yelp_id(business['id']):
            business = get_business_by_yelp_id(business['id'])
        else:
            bus_categories = []
            categories = business.get('categories')
            for category in categories:
                bus_categories.append(category['title'])
            str_categories = ', '.join(bus_categories)
            location = business['location']
            address = ", ".join(location['display_address'])
            # create business in business database
            business = create_business(business['id'], business['alias'], business['name'],
                                       business['image_url'], business['url'], business['review_count'],
                                       business['rating'], business.get(
                                           'price'),
                                       str_categories, business['distance'], address)
        # create connection between search.id and business.id  in searach_business database
        create_search_business(search.id, business.id)

    return short_code.short_code


def count_completes(search_id):

    user_list = User.query.filter_by(search_id=search_id).all()

    completes = 0

    for user in user_list:
        is_complete = len(user.likes) > 0
        if is_complete == True:
            completes += 1

    return completes


def return_matches(search_id):
    """return a list of matched resturants from users"""

    likes_users = db.session.query(Like, User).join(
        User).filter_by(search_id=search_id).all()

    dict_business_likes = {}

    for like in likes_users:
        business_id = like.Like.business_id
        liking = like.Like.liking
        if business_id not in dict_business_likes:
            dict_business_likes[business_id] = 0
        if liking == True:
            dict_business_likes[business_id] += 1

    return dict_business_likes


def short_code_valid(short_code):
    """roomid is valid within 24hours days"""
    search_shortcode = ShortCode.query.filter_by(short_code=short_code).first()
    now = datetime.now()

    if (search_shortcode is None) or (search_shortcode.date_added is None):
        return False

    if search_shortcode.date_added >= now - timedelta(minutes=80):
        return True
    return False


def user_exist(name, search_id):
    users = User.query.filter_by(search_id=search_id).all()
    # TO DO come back to do it in query
    for user in users:
        if name.lower() in user.name.lower():
            return True
    return False


if __name__ == '__main__':
    from server import app
    connect_to_db(app)
