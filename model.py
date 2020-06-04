"""Models for chicken tinder app."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Search(db.Model):
    """A Search"""

    __tablename__ = 'searches'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True,)
    uuid = db.Column(db.String, nullable=False)
    num_search = db.Column(db.Integer, nullable=False)
    price_range = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return f'<Search search_id={self.id} uuid={self.uuid} num_search={self.num_search} price_range={self.price_range}>'


class Business(db.Model):
    """A Buiness"""

    __tablename__ = 'businesses'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True,)
    yelp_id = db.Column(db.String, unique=True, nullable=False)
    yelp_alias = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f'<Business business_id={self.id} yelp_id={self.yelp_id} yelp_alias={self.yelp_alias} >'


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
    search_id = db.Column(db.Integer, db.ForeignKey('searches.id'))

    def __repr__(self):
        return f'<User id={self.id} name={self.name} search_id={self.search_id} >'


class Like(db.Model):
    """A Like."""

    __tablename__ = 'likes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True,)
    bussiness_id = db.Column(db.Integer, db.ForeignKey('businesses.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    liking = db.Column(db.Boolean)

    business = db.relationship('Business', backref='likes')
    user = db.relationship('User', backref='likes')

    def __repr__(self):
        return f'<Like id={self.id} business_id={self.business_id} user_id={self.user_id} liking={self.liking}>'


def connect_to_db(flask_app, db_uri='postgresql:///chicken_tinder', echo=True):
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
