# Steemit More Info - Chrome Extension + Firefox Extension

<center>
    
![](https://i.imgsafe.org/2a/2a1e11099e.png)

</center>

A simple Steemit extension that shows more info on steemit.com

If you use steemit.com, you may have notice that it is lacking a lot of functionalities.
That's why you need to use tools like https://steemd.com/, https://steemdb.com/, https://steemstats.com/, https://www.steemnow.com/, ...
A lot of tools!

**_So why another tool???_**
Because this is a Chrome and Firefox extension that you install on your browser, and then **all the informations you need will be available to you directly on steemit.com!**


_Please take into consideration that this is a new project that I just started, and the features are limited to just a few so far! I'm planning to add more and more features in the next versions. Every suggestion and idea is very much appreciated!_


## Features

* In the profile page of any account, you will see a **Vote Power indicator** on top (next to the name and the reputation), with the reward that a 100% vote from that user will give in SBD ($)

* In the profile page of any account, you will see the **number of votes that user has done today**

  ![](https://i.imgsafe.org/29/299a199a65.png)

---

* A new tab _'Votes'_ is added, where you may see the **latest upvotes done or received** by that user
# TODO: CAMBIARE FOTO E DIRE CHE ORA FA VEDERE ANCHE LA STIMA IN $ DEL VOTO
  ![](https://i.imgsafe.org/29/29b0ccb03d.png)

---

* When you click upvote and the Vote Weight slider appears, not only you see the percentage of the vote, but you also see **the amount in $ that upvote will be valued**

  ![](https://i.imgsafe.org/29/29bcda41b5.png)


<br>
<br>
<br>

## Future development

I'm planning to add more features like:
* A panel that shows additional info about the users that upvoted a post, for instance what vote weight they used, how much shares they got, how much is their expected curation reward, ...
* A better follower page, where you can also sort the followers by date they added you.
* **Notifications**, for instance if somebody replies on one of your posts or comments, if you get an upvote, ...
* Maybe adding a page with some graphs of the stats of the account 
* ...

## Privacy - Do I steal your data?

**I do not access your private keys**. The only way I could do it, is if you go to your wallet page and click on "show private key". But I don't do it!
Should you trust me? Well, I believe is better not to trust anyone. That's why the source code of the extension is available on github and you can (and you are encourage to) look and study it!

The way it works is by scraping the webpage and the url of the page you are looking at to extract your username and the username of the user you are looking at. Then it uses steem-js to get informations about that user. 
This process doesn't involve any private key! In fact, you can see informations of other users as well, even if you obbiuvsly don't know their private keys.


## Installation

_(Currently you will need to install it yourself)_

- Download and unzip the extension. LINK: <a href="https://github.com/armandocat/steemit-more-info/archive/master.zip">https://github.com/armandocat/steemit-more-info/archive/master.zip</a>
- _If you are using Chrome_
  - Open the Chrome Extentions page by typing `chrome://extensions` in your Chrome Browser.
  - Drag and drop the root folder of the project you just unzipped _(steemit-more-info)_ inside the chrome extension page.
- _If you are using Firefox_
  - Open `about:debugging` in Firefox, click "Load Temporary Add-on" and select any file in the extension's directory.
- Go to [Steemit](https://www.steemit.com)!

_When a new version of the extension is available, a popup in the top right corner of the page will appear with a link where you can read about the update and download the new version. Unfortunatelly, auto update is not available right now, but this way, you have the option to look at the code before installing it ;)_

## Bugs and new features requests

Please feel free to comment here or contact me on steemit.chat if you have suggestions or features requests!

<br>

### Please help me spread the word by resteem and upvote this post!
I'm doing this project in my free time. The more interest I get from the community, the more I'll be devoted to improve it!

_The code is based on the chrome extension "Steemit Voting Power" by @daynewr. I refactored (pretty much rewriting everything) and added new functionalities to it (like the votes page)_


Thanks!
