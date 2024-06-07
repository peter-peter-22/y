import express from "express";

const router = express.Router();

router.get("/get_user", async (req, res) => {
    res.json({
        user: req.user,
        showStartMessage: req.session.showStartMessage,
        pending_registration: req.session.pending_registration,
        maxLetters:GetMaxLetters(req.user)
    });
});

function GetMaxLetters(user)
{
    return 280;
}

export default router;
export {GetMaxLetters};