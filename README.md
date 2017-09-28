# Steemit More Info 1.2 - Chrome Extension + Firefox Extension

<center>
    
![](https://i.imgsafe.org/79/79ef9b1550.png)

</center>

A simple Steemit extension that shows more info on steemit.com

If you use steemit.com, you may have notice that it is lacking a lot of functionalities.
That's why you need to use tools like https://steemd.com/, https://steemdb.com/, https://steemstats.com/, https://www.steemnow.com/, ...
A lot of tools!

**_So why another tool???_**
Because this is a Chrome and Firefox extension that you install on your browser, and then **all the informations you need will be available to you directly on steemit.com!**


_Please take into consideration that this is a new project that I just started, and the features are limited to just a few so far! I'm planning to add more and more features in the next versions. Every suggestion and idea is very much appreciated!_


### This is version 1.2 with some bug fixes and a few ![new](https://i.imgsafe.org/65/655926ba30.png) features added 

<br>

## Features

* In the profile page of any account, you will see a **Vote Power indicator** on top (next to the name and the reputation), with the reward that a 100% vote from that user will give in SBD ($)

* In the profile page of any account, you will see the **number of votes that user has done today**

  ![](https://i.imgsafe.org/29/299a199a65.png)

---

* A new tab _'Votes'_ is added, where you may see the **latest upvotes done or received** by that user.
  It shows the estimate of the votes in $ too!
  You can filter the votes between _incoming votes_ and _outgoing votes_
  ![](https://i.imgsafe.org/94/9455d3ba4b.png)

---

* ![](https://i.imgsafe.org/65/655926ba30.png) Added a **dropdown menu with links to external tools** to get more info about the steem account. Please let me know what tools you'd like to see here ;)

    ![](https://i.imgsafe.org/d8/d85792ac59.png)

---

* When you click upvote and the Vote Weight slider appears, not only you see the percentage of the vote, but you also see **the amount in $ that upvote will be valued**

  ![](https://i.imgsafe.org/29/29bcda41b5.png)

---

* When you are looking at a post or comment and you click "votes" to see the **list of people that voted that post**, you now also see what was **their contribute to the total reward**!
  ![](https://i.imgsafe.org/79/79a7ceb140.png)
  ![](https://i.imgsafe.org/79/79a7ce65ef.png)

---

* You can see the posts with two different layouts: list (default) and grid! You can change to **grid layout** using on the buttons on the top-right corner of the page. 
  ![](https://i.imgsafe.org/92/92cdbd3a63.png)

---

* On the blog page of an user, you now see **an histogram of the posts of that user** based on the creation date. You can scroll horizontally to go back in time. 
  Posts made by the user are shown in blue, reposts in green!
  
  ![](https://i.imgsafe.org/3b/3b4fee4789.png)
<br>
  By clicking on one of the bars, you can **open the list of posts made on one specific date**. This makes it easier to look at old posts of an user!
  ![](https://i.imgsafe.org/3b/3b4fda2a17.png)

  You can choose to **show the histogram automatically on page load** (_default_) or if you prefer to load the histogram on request if you find it to be too invasive. To change this setting, hover on the histogram title and select "On load: hidden"

---

* The **followers and following pages have been updated** to show a table of the followers/following, with more informations (**Reputation, STEEM Power, Upvote Worth**). You can **sort** by the different attributes by clicking on the table's column.

  ![](https://i.imgsafe.org/3b/3b4fd9648b.png)


---
  
* When you read a post, now **there is a floating bar with the tags, date, author and upvotes** of the post, so you can easily access this informations and upvote the post if you like it! 

  ![](https://steemitimages.com/DQmevE65xaGzXyMTeQX2T4pyZboXccVHEpYcrGX3njTmdTN/smi.gif)

  ![](https://i.imgsafe.org/65/655926ba30.png) If you prefer a less intrusive way, in the setting you can choose the **small floating bar layout**

  ![](https://steemitimages.com/DQmZbH9NmnvkxLufzK4aMD58toYfxKEGGAFkJQ3wPCGZU9z/gif2.gif)


---

* The **markdown editor used to write new posts now shows the preview at the right side of the editor.** While you write the post, if you scroll through your textual content, **the preview will automatically scroll** to the right point. _This feature is available for screens with at least 900px width_

  ![](https://steemitimages.com/DQmNhKFqpeU1kQPSfpoL7o7z4dG5g3WivGYNT4HmYufnRW7/smi2.gif)


---

* ![](https://i.imgsafe.org/65/655926ba30.png) If you want to better see the avatar of an account, just hover on the user picture to **open a bigger version of the avatar image**

  ![](https://steemitimages.com/DQmQELTQwaayqp2zmQW9i8uipFVoNDRAiQN4kAMD45YqDTs/gif3.gif)


---

* ![](https://i.imgsafe.org/65/655926ba30.png) **Steemit More Info Settings**. You can now choose to enable or disable each of the features provided by Steemit More Info! Just go in your account settings.

  ![](https://i.imgsafe.org/d8/d84e3cd75e.png)


<br>
<br>
<br>

## Future development

I'm planning to add more features like:
* COMING SOON: Trending of up to 5 favorite tags in one page. You select your favorite tags and you'll see the list of the top trending of all the tags combined in one list. I'm not releasing this feature yet because it still has some bugs. 
* Notifications, for instance if somebody replies on one of your posts or comments, if you get an upvote, ...
* A page with some graphs of the stats of the account 
* Working on my own API, such as _mentions notification_, _followers by date_ of follow operation, posts _reposted_ by others, ...
* Something about GIF ;)
* ...

## Privacy - Do I steal your data?

**I do not access your private keys**. The only way I could do it, is if you go to your wallet page and click on "show private key". But I don't do it!
Should you trust me? Well, I believe is better not to trust anyone. That's why the source code of the extension is available on github and you can (and you are encourage to) look and study it!

The way it works is by scraping the webpage and the url of the page you are looking at to extract your username and the username of the user you are looking at. Then it uses steem-js to get informations about that user. 
This process doesn't involve any private key! In fact, you can see informations of other users as well, even if you obbiuvsly don't know their private keys.


## Installation


![](https://i.imgsafe.org/65/655926ba30.png) **The extension is now available on the Chrome Extension Store** 
https://chrome.google.com/webstore/detail/steemit-more-info/dcbpmclnlapbkgkddhencielibcjogcf

![](https://i.imgsafe.org/65/655926ba30.png) **The extension is now available on the Firefox Extension Store** 
https://addons.mozilla.org/en-US/firefox/addon/steemit-more-info/

<br>

_If you prefer, you can choose to install it yourself manually:_

- Download and unzip the extension. LINK: <a href="https://github.com/armandocat/steemit-more-info/archive/master.zip">https://github.com/armandocat/steemit-more-info/archive/master.zip</a>
- _If you are using Chrome_
  - Open the Chrome Extentions page by typing `chrome://extensions` in your Chrome Browser.
  - Drag and drop the root folder of the project you just unzipped _(steemit-more-info)_ inside the chrome extension page.
- _If you are using Firefox_
  - Open `about:debugging` in Firefox, click "Load Temporary Add-on" and select any file in the extension's directory.
  - _You will need to do this each time you close and reopen Firefox_
- Go to [Steemit](https://www.steemit.com)!

_When a new version of the extension is available, a popup in the top right corner of the page will appear with a link where you can read about the update and download the new version._

<br>

## Bugs and new features requests

Please feel free to comment here or contact me on steemit.chat if you have suggestions or features requests!

<br>

### Please help me spread the word by resteem and upvote this post!
I'm doing this project in my free time. The more interest I get from the community, the more I'll be devoted to improve it!
So if you like this project, help me in letting everyone know about it. 
And follow me! I will post any update on this extension and other projects I'll work on! And you will also see some beautiful picture about myself 😹🐾


Thanks!
