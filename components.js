const methods = {};


methods.channelSelect = {
  blocks: [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Hi, seems like you want to get setup! First things first, we need to decide what channel you want me to post in when I get new notifications. I can post in any channel that I'm a part of, so go ahead and add me to the desired channel then come back."
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Pick a channel from the dropdown list"
      },
      "accessory": {
        "type": "static_select",
        "action_id": "CHANNEL_SELECTION",
        "placeholder": {
          "type": "plain_text",
          "text": "Select an item",
          "emoji": true
        }
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Don't see the channel you're looking for? Make sure you've added me first!\nUse */invite @osshealth_notifier* in the desired channel and try again."
      }
    }
  ]
}

methods.chooseHost = {
  blocks: [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "What augur host are you interested in? This will help me show you relevant insight about repositories and repository groups!"
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Pick a host from the dropdown list"
    },
    "accessory": {
      "type": "static_select",
      "action_id": "HOST_SELECTION",
      "placeholder": {
        "type": "plain_text",
        "text": "Select a host",
        "emoji": true
      }
    }
  }
  ]
}

methods.setupHostConfirmation = {
  blocks: [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Looks like you don't have a host setup for this workspace yet, would you like to choose one?"
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "actions",
    "elements": [
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Yes",
          "emoji": true
        },
        "action_id": "HOST_SETUP",
        "value": "HOST_SETUP"
      },
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "No",
          "emoji": true
        },
        "action_id": "DO_NOTHING",
        "value": "DO_NOTHING"
      }
    ]
  }
  ]
}

methods.removeRG = {
  blocks: [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Which Repo Groups would you like to remove?"
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Pick groups from the list"
    },
    "accessory": {
      "type": "multi_static_select",
      "action_id": "RG_DELETION",
      "placeholder": {
        "type": "plain_text",
        "text": "Select items",
        "emoji": true
      },
      "options": [
      ]
    }
  }
  ]
}

methods.removeRepos = {
  blocks: [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Which Repos would you like to remove?"
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Pick Repositories from the list"
    },
    "accessory": {
      "type": "multi_static_select",
      "action_id": "REPO_DELETION",
      "placeholder": {
        "type": "plain_text",
        "text": "Select items",
        "emoji": true
      },
      "options": []
    }
  }
  ]
}

methods.generalRemove = {
  blocks: [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "What would you like to remove?"
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "actions",
    "elements": [
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Repos",
          "emoji": true
        },
        "action_id": "REMOVE_REPOS",
        "value": "REMOVE_REPOS"
      },
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Repo Groups",
          "emoji": true
        },
        "action_id": "REMOVE_RGS",
        "value": "REMOVE_RGS"
      },
    ]
  }
  ]
}

methods.setupParser = {
  blocks: [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "What would you like to setup?"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Host",
            "emoji": true
          },
          "action_id": "HOST_SETUP",
          "value": "HOST_SETUP"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Repos",
            "emoji": true
          },
          "action_id": "REPO_SETUP",
          "value": "REPO_SETUP"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Repo Groups",
            "emoji": true
          },
          "action_id": "RG_SETUP",
          "value": "RG_SETUP"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Channels",
            "emoji": true
          },
          "action_id": "CHANNEL_SETUP",
          "value": "CHANNEL_SETUP"
        }
      ]
    }
  ]
}

methods.chooseRepos = {
  blocks: [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "What repositories are you interested in?"
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Pick a Repository from the dropdown list"
    },
    "accessory": {
      "type": "multi_static_select",
      "action_id": "REPO_SELECTION",
      "placeholder": {
        "type": "plain_text",
        "text": "Select a Repo",
        "emoji": true
      }
    }
  }
  ]
}

methods.greeting = {
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Hi there, I'm Auggie! Would you like some help learning how to interact with me?"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "action_id": "GREETING_RESPONSE_TRUE",
          "text": {
            "type": "plain_text",
            "emoji": true,
            "text": "Yes"
          },
          "value": "true",
          "style": "primary"
        },
        {
          "type": "button",
          "action_id": "GREETING_RESPONSE_FALSE",
          "text": {
            "type": "plain_text",
            "emoji": true,
            "text": "Nope, just saying hey"
          },
          "value": "false"
        }
      ]
    }
  ]
}



module.exports = methods;
