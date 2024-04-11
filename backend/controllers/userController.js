const User = require('../models/User');

const getUserDetails = async function(req, res){

    try{
        //the userId whose data user wants to see
        const requestedUsersId = req.params.userId; 
        //the userId of currently logged in user - obtain this from token
        const requestingUsersId = req.user.userId;

        //check if the data they're requesting is their own data or someone else's and respond accordingly 
        if(requestedUsersId !== requestingUsersId){            
            return res.status(403).json({ error: 'Unauthorized. You cannot request other users data at this time.' });
        }
        else{
            const user = await User.findOne({email: requestedUsersId});
            /* the following condition will never be true since this user exists as they're already logged in but it can 
            be true in the case when user is asking for data i.e. not their own so I'll keep it in for now. */
            if(!user){
                return res.status(404).json({ error: 'User not found' });
            }

            const userDetails = {
                username: 'no username yet',
                email: user.email,
                isSpotifyConnected: user.isSpotifyConnected || false
            };

            res.status(200).json(userDetails);
        }
    }catch(error){
        console.error('Error:', error);
        res.status(500).json({ error: 'Error encountered while fetching user details!' });    
    }
};

module.exports = {getUserDetails};