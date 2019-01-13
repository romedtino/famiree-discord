var filter = require('./channel_filter.js');

var jsCommand = "mb";

var type_images = {};
type_images["intj"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/mastermind-intj.png";
type_images["intp"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/thinker-intp.png";
type_images["entj"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/commander-entj.png";
type_images["entp"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/visionary-entp.png";

type_images["infj"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/counselor-infj.png";
type_images["infp"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/idealist-infp.png";
type_images["enfj"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/giver-enfj.png";
type_images["enfp"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/champion-enfp.png";

type_images["istj"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/inspector-istj.png";
type_images["isfj"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/nurturer-isfj.png";
type_images["estj"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/supervisor-estj.png";
type_images["esfj"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/provider-esfj.png";

type_images["istp"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/craftsman-istp.png";
type_images["isfp"] = "http://www.personalityperfect.com/wp-content/uploads/2015/10/isfp-the-composer-avatar.jpg";
type_images["estp"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/doer-estp.png";
type_images["esfp"] = "http://www.personalityperfect.com/wp-content/uploads/2015/09/performer-esfp.png";


// { name, type }
var Datastore = require('nedb'), 
    // Security note: the database is saved to the file `datafile` on the local filesystem. It's deliberately placed in the `.data` directory
    // which doesn't get copied if someone remixes the project.
    db = new Datastore({ filename: '.data/mbDatafile', autoload: true });

function help_info() {
  var help = {};
  help["command"] = jsCommand;
  help["help"] = "Look up or assign someone's Myer Brigg's personality type. \n";
  help["help"] += "    Usage: `!mb [name][add name type][remove name][sheet]`\n";
  help["help"] += "    e.g. `!mb add Jerome intj`"

  return help;

}

function findByType(message, query) {
  console.log("findByType");
  var dashIndex = query.indexOf('-');
  var modType = query;
  if(dashIndex > -1) {
    modType = modType.substring(0, dashIndex);
  }
  
  db.find({ type: modType.toLowerCase() }, function(err, docs) {
    var retMessage = "";
    if(!err) {
      
      retMessage += "People with personality type: " + query.toUpperCase() + " " + type_images[modType.toLowerCase()];
      
      if(docs.length <= 0) {
        retMessage += "\nNo one has this personality type.";
      }
      for(let elem of docs) {
        retMessage += "\n**" + elem.name.padEnd(15) + "**" + elem.type_string.toUpperCase();
      }
      message.channel.send(retMessage);
    } 
    
  });
}

function findByName(message, query) {
  console.log("findByName");
  db.find({ name: query }, function(err, docs) {
    var retMessage = "";
    if(!err) {
      if(docs.length <= 0) {
        findByType(message, query);
        return;
      }
      for(let elem of docs) {
        retMessage += elem.name + " is a **[" + elem.type_string.toUpperCase() + "]** " + type_images[elem.type.toLowerCase()];
      }
      message.channel.send(retMessage);
    }
  });
}

function findAll(message) {
  console.log("findAll");
// Find all documents in the collection
db.find({}).sort({name: 1}).exec(function (err, docs) {
  var retMessage = "";
    if(!err) {
      if(docs.length <= 0) {
        retMessage += "\nNo entries found.";
      }
      for(let elem of docs) {
        retMessage += "\n**" + elem.name.padEnd(15, "-") + "** " + elem.type_string.toUpperCase();
      }
    } else {
      retMessage += "Could not find entries";
    }
  message.channel.send(retMessage);
 });
}

function insert(message, name, type) {
  console.log("insert " + name);

  var dashIndex = type.indexOf('-');
  var modType = type;
  if(dashIndex > -1) {
    modType = modType.substring(0, dashIndex);
  }
  
  var entry = { "name" : name,
               "type" : modType.toLowerCase(),
               "type_string" : type.toLowerCase() };
    
  if(type_images[name.toLowerCase()] !== undefined) {
    message.channel.send("What were you really trying to do...");
    return;
  }
  
  if(type_images[modType.toLowerCase()] === undefined) {
    message.channel.send("Unrecognized type: " + type);
    return;
  }
  
  db.update({"name": name }, entry, { upsert: true }, function(err, newDoc) {
      if(!err) {
        message.channel.send("Added personality [" + type.toUpperCase() + "] for: " + name );
      } else {
        message.channel.send("Failed adding personality to list")
      }
  });
}

function remove(message, name) {
  console.log("remove");
  
  db.remove( { "name" : name }, {}, function(err, numRemoved) {
    if(!err) {
      message.channel.send("Removed " + numRemoved + " entry");
    } else {
      message.channel.send("Failed to remove entry");
    }
  });
}

function deleteDB()
{
  // Removing all documents with the 'match-all' query
  db.remove({}, { multi: true }, function (err, numRemoved) {
  });
}

function execute(command, args, message) {
  if(command === jsCommand && filter(message)) {
    var req = args[0];
    console.log(req);
    if(req === undefined) {
      findAll(message);
    } else if(req === "add") {
      if(args[1] === undefined || args[2] === undefined) 
      {
        message.channel.send("Invalid add.");
      } else {
        insert(message, args[1], args[2]);
      }
    } else if(req === "remove") {
      if(args[1] === undefined)
      {
        message.channel.send("Invalid remove.");
      } else {
        remove(message, args[1]);
      }
    } else if(req === "sheet")
    { 
      message.channel.send("https://docs.google.com/spreadsheets/d/1tn5xlhP9RnuVM4KIm92BUAQreSB-AxdHZVNSsUSxRrg/edit?usp=drivesdk");
    }
    else {
      findByName(message, args[0]);
    }
    
  }

}

module.exports.execute = execute;
module.exports.help_info = help_info;