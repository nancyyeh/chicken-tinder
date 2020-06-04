"""Server for chicken tinder app."""

from flask import (Flask, render_template, request,
                   flash, session, redirect)
from model import connect_to_db
import model
import crud  # comment out if just testing crud | there is a circulate dependency
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

@app.route('/room/<uuid>', methods=['POST'])
def create_user(uuid):
    name = request.form.get("name")
    uuid = request.form.get("room-id")
    search_id = crud.get_search_id_from_uuid(uuid)

    user = crud.create_user(name, search_id)

    list_business = crud.get_businesslist_search_id(search_id)

    return render_template('like.html', list_business=list_business)


if __name__ == '__main__':
    connect_to_db(app)
    app.run(host='0.0.0.0', debug=True)
