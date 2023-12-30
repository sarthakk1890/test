const express = require('express');
const router = express.Router();
const ForceUpdate = require('../models/forceUpdateModel');

// POST endpoint to set forceUpdate value
router.post('/setForceUpdate/:app', async (req, res) => {
    try {
        const { forceUpdate } = req.body;
        const { app } = req.params

        // Check if a record already exists
        let existingRecord = await ForceUpdate.findOne();
        console.log(existingRecord);
        if (existingRecord) {
            if (app === "cube") {
                // Update the existing record
                existingRecord.forceUpdateCube = forceUpdate;
                await existingRecord.save();
                res.status(200).json({ message: 'Force update value updated successfully!', data: existingRecord });
            } else if (app === 'buyNow') {
                existingRecord.forceUpdateBuyNow = forceUpdate;
                await existingRecord.save();
                res.status(200).json({ message: 'Force update value updated successfully!', data: existingRecord });

            } else if (app === 'cute') {
                existingRecord.forceUpdateCute = forceUpdate;
                await existingRecord.save();
                res.status(200).json({ message: 'Force update value updated successfully!', data: existingRecord });
            }

        } else {
            if (app === "cube") {
                // Update the existing record
                const updateValue = new ForceUpdate({ forceUpdateCube: forceUpdate });
                await updateValue.save();
                res.status(200).json({ message: 'Force update value updated successfully!', data: updateValue });
            } else if (app === 'buyNow') {
                const updateValue = new ForceUpdate({ forceUpdateBuyNow: forceUpdate });
                await updateValue.save();
                res.status(200).json({ message: 'Force update value updated successfully!', data: updateValue });
            } else if (app === 'cute') {
                const updateValue = new ForceUpdate({ forceUpdateCute: forceUpdate });
                await updateValue.save();
                res.status(200).json({ message: 'Force update value updated successfully!', data: updateValue });
            }

           
        }
    } catch (error) {
        res.status(500).json({ message: 'Error setting force update value', error });
    }
});


// GET endpoint to retrieve the latest forceUpdate value
router.get('/getForceUpdate', async (req, res) => {
    try {
        const latestUpdate = await ForceUpdate.findOne();
        const status = latestUpdate.forceUpdate
        res.send(status)
    } catch (error) {
        res.status(500).send('Error retrieving force update value');
    }
});


module.exports = router;
