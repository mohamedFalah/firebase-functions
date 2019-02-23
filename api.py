from flask import Flask 
from flask_restful import Resource, Api
import urllib2
import json
from bs4 import BeautifulSoup
from firebase import firebase

app = Flask(__name__)
api = Api(app)

firebase = firebase.FirebaseApplication('https://seniorproject003kfupm.firebaseio.com/',None)
def _get_access_token():
  """Retrieve a valid access token that can be used to authorize requests.

  :return: Access token.
  """
  credentials = ServiceAccountCredentials.from_json_keyfile_name(
      'service-account.json', SCOPES)
  access_token_info = credentials.get_access_token()
  return access_token_info.access_token

  
news_page = 'https://news.kfupm.edu.sa/ar/'
news_page_html = urllib2.urlopen(news_page)
soup = BeautifulSoup(news_page_html, 'html.parser')

titles = []
images = []

def news_fetch():
                output = {'status':'done'}
                #find the div needed from the website 
                for h3 in soup.findAll('h3', attrs={'class':'media-heading'}):
                        title = h3.text
                        if(title != ""):
                                titles.append(title)

                for h3 in soup.findAll('h3', attrs={'class':'media-heading'}):
                        for img in h3.findAll('img', src=True):
                                imageUrl = 'https://news.kfupm.edu.sa'+ img['src']
                                images.append(imageUrl)

                for i in range(len(titles)):
                        news = {'title':titles[i], 'image':images[i]}
                        result = firebase.post("/News", news)


class HelloWorld(Resource):

    def get(self):
        news_fetch()
        return {'status':'done'}

    

    
                    

api.add_resource(HelloWorld,'/')

if __name__ == '__main__':
    app.run(debug=True)

