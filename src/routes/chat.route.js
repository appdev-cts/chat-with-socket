    const express = require("express");
    const { accessChat, fetchChats, createGroupChat, renameGroup, removeFromGroup, addToGroup, findChat, createChat, userChats, getUserChats } = require("../controllers/chat.controller");


    const router = express.Router();

    router.route("/").post(createChat);
    // router.route("/:userId").get(userChats);
    router.route("/find/:firstId/:secondId").get(findChat);
    router.route("/:userId").get(getUserChats);
    // router.route("/group").post( createGroupChat);
    // router.route("/rename").put( renameGroup);
    // router.route("/groupremove").put( removeFromGroup);
    // router.route("/groupadd").put( addToGroup);

    module.exports = router;
