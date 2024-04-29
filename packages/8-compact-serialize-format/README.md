See the difference (upper is compact format, lower is original json):

![jsx_size_comparison.png](./jsx_size_comparison.png)


Here is an example of the compact format:

```json

[
  "$RE",
  "html",
  null,
  null,
  {
    "children": [
      "$RE",
      "body",
      null,
      null,
      {
        "children": [
          [
            "$RE",
            "nav",
            null,
            null,
            {
              "children": [
                ["$RE", "a", null, null, { "href": "/", "children": "Home" }],
                ["$RE", "hr", null, null, {}],
                ["$RE", "input", null, null, {}],
                ["$RE", "hr", null, null, {}]
              ]
            }
          ],
          [
            "$RE",
            "main",
            null,
            null,
            {
              "children": [
                "$RE",
                "section",
                null,
                null,
                {
                  "children": [
                    [
                      "$RE",
                      "h2",
                      null,
                      null,
                      {
                        "children": [
                          "$RE",
                          "a",
                          null,
                          null,
                          { "href": "/hello-world", "children": "hello-world" }
                        ]
                      }
                    ],
                    [
                      "$RE",
                      "article",
                      null,
                      null,
                      {
                        "children": [
                          "$RE",
                          "$RF",
                          null,
                          null,
                          {
                            "children": [
                              [
                                "$RE",
                                "p",
                                "0",
                                null,
                                {
                                  "children": [
                                    ["$RE", "em", "0", null, { "children": ["Hi everyone!"] }],
                                    " This is my first blog post. I <3 ",
                                    [
                                      "$RE",
                                      "a",
                                      "2",
                                      null,
                                      { "href": "https://react.dev", "children": ["React"] }
                                    ],
                                    "."
                                  ]
                                }
                              ],
                              "\n",
                              [
                                "$RE",
                                "p",
                                "2",
                                null,
                                {
                                  "children": [
                                    [
                                      "$RE",
                                      "img",
                                      "0",
                                      null,
                                      {
                                        "src": "data:image/jpeg;base64,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",
                                        "alt": "llama adorable"
                                      }
                                    ]
                                  ]
                                }
                              ]
                            ]
                          }
                        ]
                      }
                    ]
                  ]
                }
              ]
            }
          ],
          [
            "$RE",
            "footer",
            null,
            null,
            {
              "children": [
                [
                  "$RE",
                  "$RF",
                  null,
                  null,
                  {
                    "children": [
                      ["$RE", "hr", null, null, {}],
                      ["$RE", "div", null, null, {}]
                    ]
                  }
                ],
                [
                  "$RE",
                  "p",
                  null,
                  null,
                  {
                    "children": [
                      "$RE",
                      "i",
                      null,
                      null,
                      { "children": ["(c) ", "Jae Doe", " ", 2024] }
                    ]
                  }
                ]
              ]
            }
          ]
        ]
      }
    ]
  }
]

```