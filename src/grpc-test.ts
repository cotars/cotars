export const protoJSON = {
    "nested": {
      "com": {
        "nested": {
          "cotars": {
            "nested": {
              "accounts": {
                "nested": {
                  "LoginRequest": {
                    "fields": {
                      "account": {
                        "type": "string",
                        "id": 1
                      },
                      "password": {
                        "type": "string",
                        "id": 2
                      }
                    }
                  },
                  "LoginResponse": {
                    "fields": {
                      "uid": {
                        "type": "uint32",
                        "id": 1
                      },
                      "nickname": {
                        "type": "string",
                        "id": 2
                      }
                    }
                  },
                  "Test": {
                    "methods": {
                      "login": {
                        "requestType": "LoginRequest",
                        "responseType": "LoginResponse"
                      }
                    }
                  }
                }
              },
              "users": {
                "nested": {
                  "InfoRequest": {
                    "fields": {
                      "uid": {
                        "type": "uint32",
                        "id": 1
                      },
                      "token": {
                        "type": "string",
                        "id": 2
                      }
                    }
                  },
                  "InfoResponse": {
                    "fields": {
                      "uid": {
                        "type": "uint32",
                        "id": 1
                      },
                      "nickname": {
                        "type": "string",
                        "id": 2
                      }
                    }
                  },
                  "LoginResponse": {
                    "fields": {
                      "uid": {
                        "type": "uint32",
                        "id": 1
                      },
                      "nickname": {
                        "type": "string",
                        "id": 2
                      },
                      "avatar": {
                        "type": "string",
                        "id": 3
                      }
                    }
                  },
                  "Test": {
                    "methods": {
                      "info": {
                        "requestType": "InfoRequest",
                        "responseType": "InfoResponse"
                      },
                      "login": {
                        "requestType": "InfoRequest",
                        "responseType": "LoginResponse"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }