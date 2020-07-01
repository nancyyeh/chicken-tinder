"""Models for chicken tinder app."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Search(db.Model):
    """A Search"""

    __tablename__ = 'searches'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True,)
    uuid = db.Column(db.String, nullable=False)
    num_search = db.Column(db.Integer, nullable=False)
    price_range = db.Column(db.ARRAY(db.Integer), nullable=True)

    def __repr__(self):
        return f'<Search search_id={self.id} uuid={self.uuid} num_search={self.num_search} price_range={self.price_range}>'


class Business(db.Model):
    """A Buiness"""

    __tablename__ = 'businesses'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True,)
    yelp_id = db.Column(db.String, unique=True, nullable=False)
    yelp_alias = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    image_url = db.Column(db.String, nullable=False)
    url = db.Column(db.String, nullable=False)
    review_count = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Float, nullable=False)
    price = db.Column(db.String, nullable=True)
    categories = db.Column(db.String, nullable=True)
    distance = db.Column(db.Float, nullable=True)
    display_address = db.Column(db.String, nullable=True)

    def todict(self):
        return {
            "id": self.id,
            "yelp_id": self.yelp_id,
            "yelp_alias": self.yelp_alias,
            "name": self.name,
            "image_url": self.image_url,
            "url": self.url,
            "review_count": self.review_count,
            "rating": self.rating,
            "price": self.price,
            "categories": self.categories,
            "distance": self.distance,
            "display_address": self.display_address,
        }

    def __repr__(self):
        return f'<Business business_id={self.id} yelp_id={self.yelp_id} yelp_alias={self.yelp_alias} name={self.name} image_url={self.image_url} url={self.url} review_count={self.review_count} rating={self.rating} price={self.price}>'


class SearchBusiness(db.Model):
    """A Search Business."""

    __tablename__ = 'search_business'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True,)
    search_id = db.Column(db.Integer, db.ForeignKey('searches.id'))
    business_id = db.Column(
        db.Integer, db.ForeignKey('businesses.id'))

    search = db.relationship('Search', backref='search_business')
    business = db.relationship('Business', backref='search_business')

    def __repr__(self):
        return f'<Business id={self.id} search_id={self.search_id} business_id={self.business_id} >'


class User(db.Model):
    """A user."""

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True,)
    name = db.Column(db.String)
    completed = db.Column(db.Boolean)
    search_id = db.Column(db.Integer, db.ForeignKey('searches.id'))

    def todict(self):
        return {
            "id": self.id,
            "name": self.name,
            "completed": self.completed,
            "search_id": self.search_id,
        }

    def __repr__(self):
        return f'<User id={self.id} name={self.name} completed={self.completed} search_id={self.search_id} >'


class Like(db.Model):
    """A Like."""

    __tablename__ = 'likes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True,)
    business_id = db.Column(db.Integer, db.ForeignKey('businesses.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    liking = db.Column(db.Boolean)

    business = db.relationship('Business', backref='likes')
    user = db.relationship('User', backref='likes')

    def todict(self):
        return {
            "id": self.id,
            "bus_id": self.business_id,
            "user_id": self.user_id,
            "liking": self.liking,
        }

    def __repr__(self):
        return f'<Like id={self.id} business_id={self.business_id} user_id={self.user_id} liking={self.liking}>'


class ShortCode(db.Model):
    "Short code with search id"

    __tablename__ = 'shortcodes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True,)
    short_code = db.Column(db.String(4), unique=True, nullable=False)
    search_id = db.Column(db.Integer, db.ForeignKey('searches.id'))
    date_added = db.Column(db.DateTime)

    def __repr__(self):
        return f'<Short Code={self.id} search_id={self.search_id} short_code={self.short_code} date={self.date_added}>'


def connect_to_db(flask_app, db_uri='postgresql:///chicken_tinder', echo=False):
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    flask_app.config['SQLALCHEMY_ECHO'] = echo
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.app = flask_app
    db.init_app(flask_app)

    print('Connected to the db!')


if __name__ == '__main__':
    from server import app

    # Call connect_to_db(app, echo=False) if your program output gets
    # too annoying; this will tell SQLAlchemy not to print out every
    # query it executes.

    connect_to_db(app)
