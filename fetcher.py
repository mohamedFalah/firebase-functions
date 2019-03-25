#importing libraries 
import urllib2
import json
from bs4 import BeautifulSoup
from firebase import firebase

class fetcher:
 
        firebase = firebase.FirebaseApplication('https://kfupm-social-space.firebaseio.com/',None)

        #declareing variable for the page url 

        news_page = 'https://news.kfupm.edu.sa/ar/'

        #return the html of the page 

        news_page_html = urllib2.urlopen(news_page)

        #ptarse the html to work with beautifulsoup (this will
        # contain the html of the page)

        soup = BeautifulSoup(news_page_html, 'html.parser')
        
        titles = []
        images = []
        news_page =[]

        
        #find the div needed from the website 
        for h3 in soup.findAll('h3', attrs={'class':'media-heading'}):
                title = h3.text
                if(title != ""):
                        titles.append(title)

        for h3 in soup.findAll('h3', attrs={'class':'media-heading'}):
                for img in h3.findAll('img', src=True):
                        imageUrl = 'https://news.kfupm.edu.sa'+ img['src']
                        images.append(imageUrl)

        for div in soup.findAll('div', attrs={'class':'media-body'}):
                for a in div.findAll('a', href=True):
                        NewsUrl = 'https://news.kfupm.edu.sa'+ a['href']
                        news_page.append(NewsUrl)

        for i in range(len(titles)):
                news = {'title':titles[i], 'image':images[i], 'page':news_page[i]}
                sent = json.dumps(news)
                result = firebase.post("/News", news)
                
        print("Done")
                        

                
        



#print 'here it is '+ name.encode('utf-8');

