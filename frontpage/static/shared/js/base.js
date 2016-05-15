/**
 * @license Copyright (c) 2016 - Sean Bailey - All Rights Reserved
 * Looking for source code? Check it out here: https://github.com/LuckehPickle/Comet
 */

/**
 * [Shared] BASE.JS - Copyright (c) 2016 - Sean Bailey - All Rights Reserved
 * Powered by Django (https://www.djangoproject.com/) - Not endorsed by Django
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * indexOfEnd
 * http://stackoverflow.com/a/18893403/5658441
 * @return {number} Gets the index of the end of a substring
 */
String.prototype.indexOfEnd = function(string) {
    var io = this.indexOf(string);
    return io == -1 ? -1 : io + string.length;
}


/**
 * Message Types
 * Enum for push message types. This essentially allows the creation of
 * push messages that are compatible with Django's messaging framework.
 * https://git.io/vwgcG
 * @enum {number}
 */
var MessageTypes = {
    DEBUG: 10,
    INFO: 20,
    SUCCESS: 25,
    WARNING: 30,
    ERROR: 40,
}


/**
 * Print
 * Formats and outputs a string to the console.
 * @param {boolean} error Show as an error
 * @param {string} out Message to output
 */
function print(error, out){
    var date = new Date();
    var message = "[" + date.getHours() + ":" + date.getMinutes() + "] [Comet] " + out;
    if(error){
        console.error(message);
        return;
    }
    console.log(message);
}


/**
 * Create Push Message
 * Creates, displays and initialises a new push message.
 * @param {number} type Type of push message. Refer to MessageType enum.
 * @param {string} message Message to display on the push message.
 */
function createPushMessage(type, message){
    $(".push-messages").append(
        "<div class=\"push-message-container-" + type + "\" data-new>" +
            "<svg class=\"push-message-close-" + type + "\" viewBox=\"0 0 20 20\">" +
                "<path d=\"M0 3 L3 0 L10 7 L17 0 L20 3 L13 10 L20 17 L17 20 L10 13 L3 20 L0 17 L7 10 z\">" +
            "</svg>" +
            "<p class=\"push-message-content-" + type + "\">" + message + "</p>" +
        "</div>"
    );

    var $container = $("[class^=\"push-message-container\"][data-new]");
    $container.fadeIn(300);
    $container.removeAttr("data-new");

    $("[class^=\"push-message-close\"]").on("click", function(){
        closePushMessage($(this));
    });
}


/**
 * Close Push Message
 * Closes a puch message and sends a confirmation response to the server
 * if necessary.
 * @param {Element} source Element which fired the event.
 */
function closePushMessage(source){
    // Move up the DOM until you reach the container
    while(!source.is("[class*=\"push-message-container\"]")){
        source = source.parent();
    }

    source.slideUp(300, function(){
        source.remove();
        print(false, "Push message closed.");
        /**
         * TODO send confirmation here, so that messages will last across
         * multiple page loads (until the user performs an action which
         * causes the message to close).
         * This will require Sockets to be handled in this script first.
         */
    });
}


/**
 * Modal Importance
 * Enum for modal importance levels.
 * @enum {number}
 */
var ModalImportance = {
    LOW: 0, // Modals that are not from the user
    MEDIUM: 50, // Typically modals that the user has requested
    HIGH: 100, // Any modal with a pressing need to be seen by the user.
}

// Keeps track of all registered modals
var modals = {};


/**
 * Modal
 * Contains a modals foreground and background components as well as some
 * other metadata (including importance).
 */
class Modal{
    constructor(title, foreground, background, importance){
        this.title = title;
        this.foreground = $(foreground);
        this.background = $(background);
        this.importance = importance;
    }

    /**
     * Is Foreground
     * Checks if the modal is currently rendered in the foreground
     * @return {boolean} Is the modal in the foreground
     */
    isForeground(){
        return this.foreground.is("[active]");
    }
}


/**
 * Show Modal
 * Attempts to show the modal that is given. If the importance level is
 * lower than the currently active modal (if any), then the modal will be
 * automatically shown in the modal queue (background).
 * @param {Modal} modal Modal to be shown to the user
 * @param {boolean} foreground Whether the modal should be shown in the foreground
 */
function showModal(modal, foreground){
    if(foreground){
        // Check if there is room in the foreground
        var activeModal = getModalInForeground();
        if(activeModal != null){
            if(modal.importance <= activeModal.importance){
                setModalInBackground(modal, false);
                return;
            }
        }
        setModalInForeground(modal);
        return;
    }
    setModalInBackground(modal, true);
}


/**
 * Hide Modal
 * Hides a modal.
 * @param {Modal} modal Modal to be hidden
 */
function hideModal(modal){
    if(modal.foreground.is("[active]")){
        modal.foreground.fadeOut(300, function(){
            modal.foreground.removeAttr("active");
            // TODO Show next queued modal
        });

        $("._modal-wrapper").fadeOut(300, function(){
            $(this).removeAttr("active");
        });
    }

    if(modal.background.is("[active]")){
        modal.background.slideDown(300, function(){
            modal.background.hide();
            modal.background.removeAttr("active");
        });
    }
    print(false, "Hiding modal with title '" + modal.title + "'");
}


/**
 * Get Modal In Foreground
 * Gets any modals which are currently in the foreground and active.
 * @return {Modal} The modal in the foreground (if any).
 */
function getModalInForeground(){
    for(var key in modals){
        var modal = modals[key];
        if(modal.isForeground()){
            return modal;
        }
    }
}


/**
 * Set Modal In Foreground
 * Queues any modal that is currently in the foreground, and pushes this
 * modal to the foreground.
 * @param {Modal} modal Modal to be moved to the foreground
 */
function setModalInForeground(modal){
    if(modal.foreground.is("[active]"))
        return;

    var activeModal = getModalInForeground();
    if(activeModal != null){
        setModalInBackground(activeModal, false);
    }

    if(modal.background.is("[active]")){
        modal.background.slideDown(300, function(){
            modal.background.hide();
            modal.background.removeAttr("active");
        });
    }

    if(!$("._modal-wrapper").is("[active]")){
        $("._modal-wrapper").fadeIn(300);
        $("._modal-wrapper").attr("active", "");
    }

    modal.foreground.fadeIn(300);
    modal.foreground.attr("active", "");
    print(false, "Showing modal titled '" + modal.title + "' in foreground.")
}


/**
 * Set Modal In Background
 * Queues any modal that is currently in the foreground, and pushes this
 * modal to the foreground.
 * @param {Modal} modal Modal to be set to the background
 * @param {boolean} check Whether to check if the wrapper needs to be hidden
 */
function setModalInBackground(modal, check){
    if(modal.background.is("[active]"))
        return;

    if(modal.foreground.is("[active]")){
        modal.foreground.fadeOut(300, function(){
            $(this).removeAttr("active");
        });
    }

    if(check && $("._modal-wrapper").is("[active]")){
        $("._modal-wrapper").fadeOut(300, function(){
            $(this).removeAttr("active");
        });
    }

    modal.background.fadeIn(300);
    modal.background.attr("active", "");
    print(false, "Showing modal titled '" + modal.title + "' in background.");
}


/**
 * Get Modal Object From Element
 * Attempts to get find the registered modal assosciated with a particular
 * modal element.
 * @param {Object} element Assosciated element
 * @return {Modal} The registered modal (if found)
 */
function getModalObjectFromElement(element){
    if(!element.is("._modal[class*='modal-']"))
        return; // Elem is not a modal

    var className = element.attr("class");
    var index = className.indexOfEnd("modal-");
    var title = className.substring(index, className.indexOf(" ", index));
    if(title in modals){
        return modals[title];
    }
}


/**
 * Sockets from here down
 */
/** @const */ var CONNECTION_ERROR_DELAY = 300;
var connectionTimer; // Tracks the time it's taken to connect
var socket; // A reference to the Socket IO socket.
var connected = false;
var queue = [];


/**
 * Start Socket
 * Attempts to open a connection with the socket server, but only if the
 * user is logged in.
 */
function _startSocket(){
    if(window.user_id != null){
        _openConnection();
    }
};


/**
 * Open Connection
 * Attempts to open a connection with the socket server
 */
function _openConnection(){
    print(false, "Connecting to socket server...");
    socket = io.connect("/messenger");
    socket.on("connect", _handleSocketConnect);
    socket.on("disconnect", _handleSocketDisconnect);
    socket.on("message", _handleSocketMessage);
    _setConnectionTimer();
}


/**
 * Handle Socket Connect
 */
function _handleSocketConnect(){
    connected = true;
    clearTimeout(connectionTimer);
    hideModal(getModalObjectFromElement($(".modal-connecting")));
    print(false, "Connected to socket server");
    checkQueue();
};


/**
 * Handle Socket Disconnect
 * Occurs whenever the connnection between the client and server is
 * severed (this will only occur if the connection is lost or there is
 * an internal server error). When this event is fired, Comet will
 * attempt to reconnect to the socket server.
 */
function _handleSocketDisconnect(){
    connected = false;
    _setConnectionTimer();
    print(true, "Unexpectedly disconnected from socket server");
};


/**
 * Set Connection Timer
 */
function _setConnectionTimer(){
    clearTimeout(connectionTimer);
    connectionTimer = setTimeout(function(){
        print(false, "Connection taking too long, showing modal");
        showModal(getModalObjectFromElement($(".modal-connecting")), true);
    }, CONNECTION_ERROR_DELAY);
}


/**
 * Handle Socket Message
 * Handles incoming messages from the socket server, subdividing
 * each message type into it's own function.
 * @param {Object} data Data from socket server
 */
function _handleSocketMessage(data){
    if(!("action" in data)){
        print(true, "A malformed message was received from the socket server. (Socket Message).");
        return;
    }

    switch(data.action){
        case "search":
            _handleQueryResponse(data);
            break;
        case "push_message":
            _handlePushMessage(data);
            break;
        case "message":
            _handleChatMessage(data);
            break;
        default:
            print(false, "A message was received with an unrecognized action: '" + data.action + "'");
    }
};


/**
 * Handle Push Message
 * Handles and displays an incoming push message in the same way that a
 * message from Django's messaging framework would be handled.
 * @param {Object} data Data from socket server
 */
function _handlePushMessage(data){
    if(!("type" in data) || !("message" in data)){
        print(true, "A malformed message was received from the Socket IO server. (Push Message)");
        return;
    }

    print(false, "Received message of type '" + data.type + "'. Displaying.");
    createPushMessage(data.type, data.message);

    // Handle any buttons that could be appended to the message
    $("[class^=\"button-request-\"][data-user-id][data-new]").on("click", function(event){
        var accept = $(this).is("[class*=\"accept\"]");
        answerFriendRequest(accept, $(this).attr("data-user-id"));
        closePushMessage($(this));
    });
    $("[class^=\"button-request-\"][data-user-id][data-new]").removeAttr("data-new");

    if(data.request_confirmation && "message_id" in data){
        // Server has asked the client to confirm that it received this message
        send("message_confirm", data.message_id);
        print(false, "Message confirmation sent for message with id '" + data.message_id + "'");
    }
};


/**
 * Handle Chat Message
 * @param {Object} data Data from the socket server
 */
function _handleChatMessage(data){

}


/**
 * Send
 * Sends data back to the socket server.
 * @param {String} eventType Event to fire
 * @param {Object} data Data to send to server
 */
function send(eventType, data){
    if(!connected){
        queue.push({
            eventType: eventType,
            value: data,
        });
        return;
    }
    socket.emit(eventType, data);
}


/**
 * Check Queue
 * Checks to see if any data is sitting in the Queue, and sends it to
 * the socket server.
 */
function checkQueue(){
    if(queue.length > 0 && connected){
        for(var i = 0; i < queue.length; i++){
            var item = queue[i];
            socket.emit(item["eventType"], item["value"]);
        }
        print(false, "Emptied socket queue.");
    }
}


/**
 * Send Friend Request
 * Sends a friend request to a given user (requires that users UUID).
 * @param {string} user_id UUID of the target user
 */
function sendFriendRequest(user_id){
    send("friend_req", user_id);
    print(false, "Friend request sent to user with id '" + user_id + "'");
};


/**
 * Answer Friend Request
 * Responds to a friend request.
 * @param {boolean} accept Should the request be accepted
 * @param {string} user_id UUID of the target user
 */
function answerFriendRequest(accept, user_id){
    send("answer_friend_req", {
        accept: accept,
        user_id: user_id,
    });
    print(false, (accept ? "Accepted" : "Denied") + " friend request from user with id '" + user_id + "'.");
}


/**
 * Add Event Listeners
 */
function addEventListeners(){
    // Listens for click events on push message close buttons
    $("[class^=\"push-message-close\"], [class^=\"button-request-\"]").on("click", function(){
        closePushMessage($(this));
    });

    /**
     * Listens for buttons with the class run-in-bg. These buttons will
     * push a modal to the queue.
     */
    $(".bgify").on("click", function(){
        var parent = $(this).parent();
        while(!parent.hasClass("_modal")) // Scale the DOM tree
            parent = parent.parent();
        setModalInBackground(getModalObjectFromElement(parent), true);
    });

    $("._modal[background]").on("click", function(){
        var modal = $(this);
        while(!modal.hasClass("_modal")) // Scale the DOM tree
            modal = modal.parent();
        setModalInForeground(getModalObjectFromElement(modal));
    });

    $(document).pjax("a[data-pjax], a[data-pjax-m]", ".pjax-body");
    $(document).on("pjax:start", function() { NProgress.start(); });
    $(document).on("pjax:end",   function() { NProgress.done();  });
    NProgress.configure({ showSpinner: false });
};


/**
 * Register Modals
 * Register and modals here
 */
function registerModals(){
    modals["connecting"] = new Modal(
        "connecting",
        $(".modal-connecting[foreground]"),
        $(".modal-connecting[background]"),
        ModalImportance.HIGH
    );
};


/**
 * JQuery Document Ready function. The following code is run whenever the page
 * has finished loading and is ready to work with.
 */
$(function(){
    // Fade in any idle push messages
    $("div[class^=\"push-message-container\"]").fadeIn(300);


    addEventListeners();
    registerModals();
    _startSocket();
});
