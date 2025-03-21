const chatModel = require('../models/chatModel');

const saveTheChat = async(req, res) => {
    try{
        const { chat } = req.body;
        await chatModel.saveChatToSavedChats(chat);
        await chatModel.updateSavedState(chat);
        return res.status(200).json({ message: "保存成功" });
    }catch(err){
        return res.status(400).json({ err: err.message });

    }
}

//更新历史记录，超出则删除，保持十条
const updateChatHistory = async (req, res) => {
    try {
        const rows = await chatModel.getChatHistory();
        if (rows.length >= 10) {
            await chatModel.deleteChat(rows[0].id); 
        }
        const { chat } = req.body;
        await chatModel.saveChatToChatHistory(chat);
        return res.status(200).json({ message: "更新成功" });

    } catch (err) {
        return res.status(400).json({ err: err.message });
    }
}

const getChatHistroy = (req, res) => {
    chatModel.getChatHistory().then(rows => {
        return res.status(200).json({ chats: rows })

    }).catch((err) => {
        return res.status(400).json({ err: err.message });

    })
}

const getSavedChats = (req, res) => {
    chatModel.getSavedChats().then(rows => {
        return res.status(200).json({ chats: rows })
    }).catch((err) => {
        return res.status(400).json({ err: err.message });

    })
}



module.exports = { saveTheChat, updateChatHistory, getChatHistroy,getSavedChats }