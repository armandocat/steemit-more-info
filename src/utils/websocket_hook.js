wsHook.before = function(data, url) {
    console.log("Sending message to " + url + " : " + data);
}

wsHook.after = function(messageEvent, url) {
    console.log("Received message from " + url + " : " + messageEvent.data);
    return messageEvent;
}
