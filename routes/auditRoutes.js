const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

// user发起审核
router.post('/createAudit', auditController.createAudit);




module.exports = router;