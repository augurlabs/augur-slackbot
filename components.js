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

methods.repoInputModal = {
  "type": "modal",
  "callback_id": "REPO_SUBMISSION",
  "title": {
    "type": "plain_text",
    "text": "Repo Setup",
    "emoji": true
  },
  "submit": {
    "type": "plain_text",
    "text": "Submit",
    "emoji": true
  },
  "close": {
    "type": "plain_text",
    "text": "Cancel",
    "emoji": true
  },
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Hi! What Repositories are you interested in?"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "input",
      "block_id": "repoInput",
      "label": {
        "type": "plain_text",
        "text": "Individual Repositories"
      },
      "hint": {
        "type": "plain_text",
        "text": "*Note:* All values should be submitted as Comma Separated Lists."
      },
      "element": {
        "type": "plain_text_input",
        "action_id": "REPO_INPUT",
        "multiline": true,
        "placeholder": {
          "type": "plain_text",
          "text": "https://github.com/rails/rails.git, https://github.com/twitter/twemoji.git, etc. "
        }
      }
    }
  ]
}

methods.rgInputModal = {
  "type": "modal",
  "callback_id": "RG_SUBMISSION",
  "title": {
    "type": "plain_text",
    "text": "Repo Group Setup",
    "emoji": true
  },
  "submit": {
    "type": "plain_text",
    "text": "Submit",
    "emoji": true
  },
  "close": {
    "type": "plain_text",
    "text": "Cancel",
    "emoji": true
  },
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Hi! What Repository Groups are you interested in?"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "input",
      "block_id": "rgInput",
      "label": {
        "type": "plain_text",
        "text": "Repo Groups\n"
      },
      "hint": {
        "type": "plain_text",
        "text": "*Note:* All values should be submitted as Comma Separated Lists."
      },
      "element": {
        "type": "plain_text_input",
        "action_id": "RG_INPUT",
        "multiline": true,
        "placeholder": {
          "type": "plain_text",
          "text": "Twitter, Rails, etc."
        }
      }
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



module.exports = methods;
