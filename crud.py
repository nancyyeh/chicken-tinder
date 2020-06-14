"""CRUD operations."""

from model import db, Search, User, Like, Business, SearchBusiness, connect_to_db
import requests
import os
import json
import server
import model
import uuid

# insert API key for testing
API_KEY = os.environ['YELP_KEY']

# create date base
os.system('dropdb chicken_tinder')
os.system('createdb chicken_tinder')

model.connect_to_db(server.app)
model.db.create_all()


def create_search(num_search=20, price_range=None):
    """creata a search."""

    uuid_num = uuid.uuid4()

    search = Search(uuid=uuid_num, num_search=num_search,
                    price_range=price_range)
    db.session.add(search)
    db.session.commit()

    return search


def create_business(yelp_id, yelp_alias, name, image_url, url, review_count, rating, price):
    """creata a business with yelp details."""

    business = Business(yelp_id=yelp_id, yelp_alias=yelp_alias, name=name, image_url=image_url, url=url, review_count=review_count, rating=rating, price=price)
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

    likes = Like(user_id=user_id, business_id=business_id, liking=liking)
    db.session.add(likes)
    db.session.commit()

    return likes


def get_business_by_yelp_id(yelp_id):
    """get business with yelp id."""

    return Business.query.filter(Business.yelp_id == yelp_id).first()


def get_business_by_business_id(business_id):

    return Business.query.get(business_id)


def get_search_id_from_uuid(uuid):
    """get business with yelp id."""

    search = Search.query.filter_by(uuid=uuid).first()

    return search.id


def get_businesslist_search_id(search_id):
    """get all businesses with search id"""

    bus_list_by_id = SearchBusiness.query.filter_by(search_id=search_id).all()

    bus_list_obj = []

    for business in bus_list_by_id:
        bus = Business.query.get(business.business_id)
        bus_list_obj.append(bus)

    return bus_list_obj


def search_yelp(term, location, num_search=20, price_range=None):
    """Search yelp with the params, 
    creaste search, goes throup API, 
    create business if not exist, 
    create connection bewteen search & business"""

    # CREATE A Search
    search = create_search(num_search, price_range)

    # YELP API to gather business list and store into businesses database
    url = "https://api.yelp.com/v3/businesses/search"
    payload = {'term': term, 'location': location, 'limit': num_search, }
    key = f"Bearer {API_KEY}"

    req = requests.get(url, headers={
                       'Authorization': key}, params=payload)

    business_results = req.json()

    for business in business_results['businesses']:
        # if yelp.id is not in database create / then create connection
        if get_business_by_yelp_id(business['id']):
            business = get_business_by_yelp_id(business['id'])
        else:
            # create business in business database
            business = create_business(business['id'], business['alias'], business['name'],
                                       business['image_url'], business['url'], business['review_count'],
                                       business['rating'], business.get('price'), )
        # create connection between search.id and business.id  in searach_business database
        create_search_business(search.id, business.id)

    return search.uuid


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


if __name__ == '__main__':
    from server import app
    connect_to_db(app)
