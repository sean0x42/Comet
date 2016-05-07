# Comet (Messaging)
Comet is a private, open source messaging service built for the modern web. The site is currently still in development, with an expected closed Beta to begin sometime in April. I am developing this service single handedly as part of my 2016 HSC Major Design and Technology project.

**What makes Comet different from other instant messaging services?**  
Comet has a huge focus on user privacy and security. Unlike many other instant messaging services, we don't gather and sell your private information to pay our bills.

**Things TODO (In order to *reach* beta)**  
 - User settings
 - Email verification
 - Redo user dropdown
 - Group settings
 - Nicknames
 - ~~Redo push messages~~
 - ~~Add base template~~
 - Redo modal for creating a new chat
 - Add modal for adding users to group
 - Notification sounds
 - Find a way to alert user of new messages in other channels
 - Fix toolbar appearance, especially title and buttons.
 - ~~Migrate announceUserJoin to the new messenger.js~~
 - Mobile and tablet support
 - Fix footer + add version number
 - <https://github.com/youtube/spfjs>
 - Animate changing tabs
 - Prevent message tagging if the message is over x mins old.
 - User is typing...
 - Message sending... sent etc
 - Username changing
 - Make groups/friends load with an 'a' rather than a div with event listener to allow opening in a new tab or window.
 - Wait for socket connection before enabling the input
 - Update friends list with online statuses
 - User profiles on hover.
 - Add custom scrollbars
 - ~~Open socket connections on all pages to catch friend requests etc.~~
 - Hover over name to show profile information
 - Load video and images on hover
 - ~~Automatic reconnect to Socket server with a modal to notify the user. A button which says run in background will cause it to hide whilst a connection is re-established.~~

**Things TODO (In order to *leave* beta)**
 - End-to-end encryption of all packets.
 - Android app
 - Premium
 - Two Factor Authentication (Google Authenticator?)
 - Desktop App (Electron?)
 - Profile pictures
 - ~~Migrate from django_socketio to gevent-socketio.~~
 - Add 'toggle-able' maintenance periods, in which developers are whitelisted.
