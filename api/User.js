const express = require('express');
const router = express.Router();

const User = require('./../models/User');

//password hash
const bcrypt = require('bcrypt');
const Tweet = require('../models/Tweet');
const UserFollows = require('../models/UserFollows');
const { json } = require('body-parser');
const { Mongoose } = require('mongoose');
const MyActivity = require('../models/MyActivity');

//signup
router.post('/signup', (req, res) => {
    
    let {username, email, password, photo} = req.body;
    username = username;
    email = email;
    password = password;
    photo = photo;

    var usernameRegex = /^[a-zA-Z ]*$/;
    var usernameValid = usernameRegex.test(username);

    var emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    var emailValid = emailRegex.test(email);

    if (username == "" || email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields"
        });
    } 
    else if (!usernameValid) {
        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        });
    }
     else if (!emailValid){
        res.json({
            status: "FAILED",
            message: "Invalid email entered"
        });
    }
     else if (password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Password is too short"
        });
    } else{
        //checking if user already exists
        User.find({email}).then(result => {
            if (result.length){
                //User already exists
                res.json({
                    status: "FAILED",
                    message: "This email is already exists"
                })
            }else{
                //try to create new user

                //password handler
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser =new User({
                        username,
                        email,
                        password: hashedPassword,
                        photo
                    });

                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Signup successful",
                            data: result
                        })
                    }).catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occurred while saving user account!"
                        })
                    })
                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while hashing password!"
                    })
                })

            }
        }).catch(err => {
            console.log(err);
            res.json({
                status : "FAILED",
                message : "An error occurred while checking for existing user"
            })
        })
    }
})

//signin
router.post('/signin', (req, res) => {
    let {email, password} = req.body;
    email = email;
    password = password;

    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty credentials supplied",
        });
    } else {
        //check if user exists
        User.find({ email })
        .then((data) => {
            if (data.length) {
                //user exists

                const hashedPassword = data[0].password;
                bcrypt
                    .compare(password, hashedPassword)
                    .then((result) => {
                    if (result) {
                        //password match

                        // var exp = new Date().getTime() + 60000;

                        // const newSession = new Session({
                        //     email:"sai@ex.com",
                        //     expiry:exp
                        // });

                        // Session.find({_id: req.headers.cookie}).then(result => {
                        //     if(result.expiry > new Date().getTime()) {
                        //         res.redirect("/user/signin");
                        //     } 
                        // })

                        // newSession.save().then(resl => {
                        //     res.cookie = resl._id;
                        // })

                        res.json({
                            status: "SUCCESS",
                            message: "signin successful",
                            data: data,
                        });
                    } else {
                        res.json({
                            status: "FAILED",
                            message:"Invalid password entered!",
                        });
                    }
                }).catch((err) => {
                   res.json({
                       status: "FAILED",
                       message: "An error occured while comparing passwords",
                   });
                });
            } else {
                res.json({
                    status: "FAILED",
                    message: "Invalid credentials entered!",
                });
            }
        })
        .catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user",
            });
        })
    }
})

//Tweet

router.post('/tweet', (req, res) => {
    
    let {tweet_content, tweet_content_img, tweet_likes, hash_tags, share_count, email, time} = req.body;
    
    const newTweet =new Tweet({
        tweet_content: tweet_content,
        tweet_content_img: tweet_content_img,
        tweet_likes:tweet_likes,
        hash_tags: hash_tags,
        share_count: share_count,
        email: email
    });
    newTweet.save(function(err, result){
        if (err) {
            res.json({
                status: "fail",
                message: "problem!!"
            })
        }else{
            console.log(result)
            const newMyActivity = new MyActivity({
                action: "create",
                email: email,
                tweet_id: result._id
            });
            newMyActivity.save().then(result2 => {
                res.json({
                    status: "success",
                    message: "yes!!",
                    data: result2
                })
            })
        }
    })
            
})

// just an insert to create a collection, dummy, delete during cleanup
router.post('/userFollows', (req, res) => {
    
    const newUF =new UserFollows({
        email: "sai@ex.com",
        hash_tags: ["hi"],
        user_follow_email_ids: ["s@ex.com"]
    });

    newUF.save().then(result => {
            res.json({
                status: "Success",
                message: "This user follows is added successfully"
            });
        })
})

//like a tweet
router.post('/likes', (req, res) => {
    
    let {_id} = req.body;
    
    Tweet.findOneAndUpdate({_id: _id}, { $inc: { tweet_likes: 1 }}, function(err, result){
        if(err){
            res.json({
                status : "FAILED",
                message : "An error occurred while incrementing the likes for a tweet"
            })
        }else{
            
            const newMyActivity = new MyActivity({
                action: "like",
                tweet_id: result._id,
                email: result.email
            });
            newMyActivity.save().then(result2 => {
                res.json({
                    status: "Success",
                    message: "Incremented the like successfully"
                });
            })
        }
    })
})

// dislike
router.post('/dislikes', (req, res) => {
    
    let {_id} = req.body;
    
    Tweet.findOneAndUpdate({_id: _id}, { $inc: { tweet_likes: -1 }}).then(result => {
            res.json({
                status: "Success",
                message: "Decremented the likes successfully"
            });
        }).catch(err => {
            console.log(err);
            res.json({
                status : "FAILED",
                message : "An error occurred while decrementing the likes for a tweet"
            })
        })

})


// follow hash tag by user
router.post('/follow_hash_tag', (req, res) => {
    
    let {email, hash_tags} = req.body;

    if (hash_tags == null || hash_tags == "") {
        res.json({
            status: "FAILED",
            message: "Hashtag is Empty.."
        })
    }else{
        UserFollows.updateOne({email: email}, { $push: { hash_tags: hash_tags }}).then(result => {
            res.json({
                status: "Success",
                message: "Followed the Hash Tag successfully!!"
            });
        }).catch(err => {
            console.log(err);
            res.json({
                status : "FAILED",
                message : "An error occurred while following the hash tag"
            })
        })
    }
})


// follow user by user
router.post('/follow_user', (req, res) => {
    
    let {email, user_follow_email_ids} = req.body;

    UserFollows.updateOne({email: email}, { $push: { user_follow_email_ids: user_follow_email_ids }}).then(result => {
        console.log(result)
        if(result.n === 0){
            var arr = new Array(new String(user_follow_email_ids));
            const newUF =new UserFollows({
                email: email,
                user_follow_email_ids: arr
            });

            newUF.save().then(result2 => {

                res.json({
                    status: "Success",
                    message: "Followed the user successfully after adding entry!!"
                });
            });
        } else if(result.ok) {        
            res.json({
                status: "Success",
                message: "Followed the user successfully!!"
            });
        }     
    }).catch(err => {
        console.log(err);
        res.json({
            status : "FAILED",
            message : "An error occurred while following the user"
        })
    })
})

// get the user details
router.route("/profile/:_id").get(function(req, res) {
    
    let {_id} = req.params

    User.findById({_id:_id}, function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.json(result);
      }
    });
  });

  // unfollow user by user
router.post('/unfollow_user/:email', (req, res) => {

    let {email} = req.params;
    let {user_follow_email_ids} = req.body;

    UserFollows.updateOne({email:email},{ $pull: { user_follow_email_ids: user_follow_email_ids }}, function(err, result){
        // console.log(err);
        // console.log(result);
        if(err || result.ok === 0){
            res.json({
                status: "Failed",
                message: "Update failed because of " + err
                }); 
        } else if(result.n === 0){
            res.json({
                status: "Failed",
                message: "Not able to find the record to update"
                });
        } else if(result.nModified === 0){
            res.json({
                status: "Failed",
                message: "Not able to update the record"
                });
        }else{
            res.json({
                status: "Success",
                message: "UnFollow user by user successfully!!"
                });
        }
    })   
})


  // unfollow follow_hash_tag by user
  router.post('/unfollow_hash_tag/:email', (req, res) => {

    let {email} = req.params;
    
    let {hash_tags} = req.body;

    UserFollows.updateOne({email:email}, { $pull: { hash_tags: hash_tags }}, function(err, result){
        console.log(err)
        console.log(result)
        if(err || result.ok === 0){
            res.json({
                status: "Failed",
                message: "Update failed because of " + err
            }); 
        } else if(result.n === 0){
            res.json({
                status: "Failed",
                message: "Not able to find the record to update"
            });
        } else if(result.nModified === 0){
            res.json({
                status: "Failed",
                message: "Not able to update the record"
            });
        }else{
            res.json({
                status: "Success",
                message: "UnFollow hashtag by user successfully!!"
            });
        }
    })
})

  // Update user details
  router.post('/updateprofile/:_id', (req, res) => {

    let {_id} = req.params;
    let {email, username, photo  } = req.body;

    User.updateOne({_id: _id}, { $set: { email: email, photo: photo, username: username }}).then(result => {
        res.json({
            status: "Success",
            message: "Updated profile successfully!!"
        });
    }).catch(err => {
        console.log(err);
        res.json({
            status : "FAILED",
            message : "An error occurred while updating profile"
        })
    })
})


  // search hashtags
  router.get('/search/:hash_tags', (req, res) => {

    let {hash_tags} = req.params;

    Tweet.find({ hash_tags: hash_tags}).then(result => {
        res.json({
            status: "Success",
            message: "get data successfully!!",
            data: result
        });

    }).catch(err => {
        console.log(err);
        res.json({
            status : "FAILED",
            message : "An error occurred while searching tweet"
        })
    })
})

  // Retweet tweets
  router.post('/retweet/:_id', (req, res) => {

    let {_id} = req.params;

    Tweet.find({ _id: _id}).then(result => {
        const temp = JSON.parse(JSON.stringify(result[0]));
        
        const newTweet = new Tweet({
            tweet_content: temp.tweet_content,
            tweet_content_img: temp.tweet_content_img,
            tweet_likes: temp.tweet_likes,
            hash_tags: temp.hash_tags,
            share_count: 0,
            email: temp.email,
            time: temp.time
        });

        newTweet.parent_id = _id;

        newTweet.save().then(result1 => {
            // console.log("The id is " + _id)
            Tweet.findOneAndUpdate({ _id: _id}, { $inc: { share_count: 1 }}).then(result2 => {
                res.json({
                    status: "SUCCESS",
                    message: "Retweeted successfully"
                })
                
            })
        })

    }).catch(err => {
        console.log(err);
        res.json({
            status : "FAILED",
            message : "An error occurred while searching tweet"
        })
    })
})


//Home page
async function get_tweets_by_hash_tag(hash_tag, arr, duplicateRemover) {
    for (tag of hash_tag) {
        const hashtagTweet = await Tweet.find({hash_tags: tag});
        for (allhashtag of hashtagTweet) {
            if(!duplicateRemover.has(JSON.stringify(allhashtag._id))) {
                arr.push(allhashtag);
                duplicateRemover.add(JSON.stringify(allhashtag._id));
            }
        }
    }

    return arr
}

async function get_tweets_by_user_followers(follow_users, arr, duplicateRemover) {
    for (follow of follow_users) {
        const followtweet = await Tweet.find({email: follow});
        for (allfollowusers of followtweet) {
            if(!duplicateRemover.has(JSON.stringify(allfollowusers._id))) {
                arr.push(allfollowusers);
                duplicateRemover.add(JSON.stringify(allfollowusers._id));
            }
        }
    }

    return arr
}


async function get_tweets(email, res) {
    const follows = await UserFollows.findOne({email: email});
    const hash_tag = follows.hash_tags; 
    var user_follows = follows.user_follow_email_ids;

    var arr = new Array();

    var duplicateRemover = new Set();

    arr = await get_tweets_by_hash_tag(hash_tag, arr, duplicateRemover)

    arr = await get_tweets_by_user_followers(user_follows, arr, duplicateRemover)

    res.json({
        status : "Success",
        message : "Able to fetch the home page details",
        data: arr
    })

}

router.post('/home', (req, res) => {

    let {email} = req.body;
    
    get_tweets(email, res);

        
})

router.post('/activity', (req, res) => {

    let {email} = req.body;
    
    MyActivity.find({email:email}).then(result => {
        res.json({
            status:"Success",
            message: "Activity data",
            data: result
        })
    })
        
})

module.exports = router;    