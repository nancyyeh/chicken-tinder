import os
import crud
import model
import server

# os.system('dropdb chicken_tinder')
# os.system('createdb chicken_tinder')

model.connect_to_db(server.app)
model.db.create_all()

crud.create_shortcodes()
