/*eslint-env mocha*/
"use strict";

const spawn = require("child_process").spawn;
const expect = require("chai").expect;
const Rserve = require("..");

const _ = require("../src/Rsrv"); // TODO: to be removed

describe("rserve-js's eval command", function() {
    let client;
    
    before(function(done) {
        let options = [
            "--RS-port",    6313
        ];
        let proc = spawn("R", ["CMD", "Rserve", "--vanilla"].concat(options), {stdio: "ignore"});
        proc.on("exit", function() {
            // R command spawns Rserve process and exit.
            client = Rserve.connect("localhost", 6313, function() {
                done();
            });
        });
    });
    
    function evaluatesTo(request, expectedResponse, done) {
        client.eval(request, function(err, response) {
            expect(err).to.be.null;
            expect(response).to.deep.equal(expectedResponse);
            done();
        });
    }
    
    function attr(obj, attr) {
        Object.defineProperties(
            obj,
            {
                "attr": {
                    enumerable: true,
                    value: attr
                }
            }
        );
        
        return obj;
    }
    
    it("supports null in REXP (XT_NULL)", function(done) {
        evaluatesTo(
            {
                type: _.XT_NULL,
                value: null
            },
            null,
            done
        );
    });
    
    it("supports an integer (XT_ARRAY_INT)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_INT,
                value: [2]
            },
            [2],
            done
        );
    });
    
    it("supports integers (XT_ARRAY_INT)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_INT,
                value: [1, 3]
            },
            [1, 3],
            done
        );
    });
    
    it("supports integers with NA (XT_ARRAY_INT)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_INT,
                value: [1, null, 3]
            },
            [1, null, 3],
            done
        );
    });
    
    it("supports a double (XT_ARRAY_DOUBLE)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_DOUBLE,
                value: [2]
            },
            [2],
            done
        );
    });
    
    it("supports doubles (XT_ARRAY_DOUBLE)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_DOUBLE,
                value: [1, 3]
            },
            [1, 3],
            done
        );
    });
    
    it("supports doubles with NA (XT_ARRAY_DOUBLE)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_DOUBLE,
                value: [1, null, 3]
            },
            [1, null, 3],
            done
        );
    });
    
    it("supports doubles with NaN (XT_ARRAY_DOUBLE)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_DOUBLE,
                value: [1, NaN, 3]
            },
            [1, NaN, 3],
            done
        );
    });
    
    it("supports a text (XT_ARRAY_STR)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_STR,
                value: ["hello"]
            },
            ["hello"],
            done
        );
    });
    
    it("supports texts (XT_ARRAY_STR)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_STR,
                value: ["hello", "world"]
            },
            ["hello", "world"],
            done
        );
    });
    
    it("supports texts with NA (XT_ARRAY_STR)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_STR,
                value: ["hello", null, "world"]
            },
            ["hello", null, "world"],
            done
        );
    });
    
    it("supports boolean TRUE (XT_ARRAY_BOOL)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_BOOL,
                value: [true]
            },
            [true],
            done
        );
    });
    
    it("supports boolean FALSE (XT_ARRAY_BOOL)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_BOOL,
                value: [false]
            },
            [false],
            done
        );
    });
    
    it("supports boolean NA (XT_ARRAY_BOOL)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_BOOL,
                value: [null]
            },
            [null],
            done
        );
    });
    
    it("supports booleans (XT_ARRAY_BOOL)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_BOOL,
                value: [true, false, null]
            },
            [true, false, null],
            done
        );
    });
    
    it("supports vector (XT_VECTOR)", function(done) {
        evaluatesTo(
            {
                type: _.XT_VECTOR,
                value: [
                    {
                        type: _.XT_ARRAY_INT,
                        value: [1, 2]
                    },
                    {
                        type: _.XT_ARRAY_STR,
                        value: ["a", "b"]
                    },
                    {
                        type: _.XT_ARRAY_BOOL,
                        value: [true, false]
                    }
                ]
            },
            [[1, 2], ["a", "b"], [true, false]],
            done
        );
    });
    
    it ("supports list (XT_LIST_TAG)", function(done) {
        evaluatesTo(
            {
                type: _.XT_VECTOR,
                value: [
                    {
                        type: _.XT_ARRAY_INT,
                        value: [1]
                    },
                    {
                        type: _.XT_ARRAY_INT,
                        value: [2]
                    }
                ],
                attr: {
                    type: _.XT_LIST_TAG,
                    value: [
                        {
                            type: _.XT_ARRAY_STR,
                            value: ["first", "second"]
                        },
                        {
                            type: _.XT_SYMNAME,
                            value: "names"
                        }
                    ]
                }
            },
            attr(
                [[1], [2]],
                {
                    names: ["first", "second"]
                }
            ),
            done
        );
    });
    // FIXME: Unlike string eval, sexp eval retuns null for CLOS. Could be a bug of Rserve.
    /*
    it ("supports function (XT_CLOS)", function(done) {
        evaluatesTo(
            {
                type: _.XT_CLOS,
                value: {
                    formals: {
                        type: _.XT_LIST_TAG,
                        value: [
                            {
                                type: _.XT_SYMNAME,
                                value: ""
                            },
                            {
                                type: _.XT_SYMNAME,
                                value: "a"
                            },
                            {
                                type: _.XT_SYMNAME,
                                value: ""
                            },
                            {
                                type: _.XT_SYMNAME,
                                value: "b"
                            }
                        ]
                    },
                    body: {
                        type: _.XT_LANG_NOTAG,
                        value: [
                            {
                                type: _.XT_SYMNAME,
                                value: "{"
                            },
                            {
                                type: _.XT_LANG_NOTAG,
                                value: [
                                    {
                                        type: _.XT_SYMNAME,
                                        value: "+"
                                    },
                                    {
                                        type: _.XT_SYMNAME,
                                        value: "a"
                                    },
                                    {
                                        type: _.XT_SYMNAME,
                                        value: "b"
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            {
                formals: {
                    a: "",
                    b: ""
                },
                body: ["{", ["+", "a", "b"]]
            },
            done
        );
    });
    
    it ("supports function with default parameters (XT_CLOS)", function(done) {
        evaluatesTo(
            {
                type: _.XT_CLOS,
                value: {
                    formals: {
                        type: _.XT_LIST_TAG,
                        value: [
                            {
                                type: _.XT_SYMNAME,
                                value: "hello"
                            },
                            {
                                type: _.XT_SYMNAME,
                                value: "a"
                            },
                            {
                                type: _.XT_SYMNAME,
                                value: "2"
                            },
                            {
                                type: _.XT_SYMNAME,
                                value: "b"
                            }
                        ]
                    },
                    body: {
                        type: _.XT_LANG_NOTAG,
                        value: [
                            {
                                type: _.XT_SYMNAME,
                                value: "{"
                            },
                            {
                                type: _.XT_LANG_NOTAG,
                                value: [
                                    {
                                        type: _.XT_SYMNAME,
                                        value: "+"
                                    },
                                    {
                                        type: _.XT_SYMNAME,
                                        value: "a"
                                    },
                                    {
                                        type: _.XT_SYMNAME,
                                        value: "b"
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            {
                formals: {
                    a: ["hello"],
                    b: [2]
                },
                body: ["{", ["rep", "a", "b"]]
            },
            done
        );
    });
    */
    it ("supports a complex (XT_ARRAY_CPLX)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_CPLX,
                value: [[1, 2]]
            },
            [[1, 2]],
        done);
    });
    
    it ("supports a complexes (XT_ARRAY_CPLX)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_CPLX,
                value: [[1, 2], [3, 4]]
            },
            [[1, 2], [3, 4]],
            done
        );
    });
    
    it ("supports a complexes with NA (XT_ARRAY_CPLX)", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_CPLX,
                value: [[1, 2], null, [3, 4]]
            },
            [[1, 2], null, [3, 4]],
            done
        );
    });
    
    it ("supports matrix", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_INT,
                value: [1, 2, 3, 4, 5, 6],
                attr: {
                    type: _.XT_LIST_TAG,
                    value: [
                        {
                            type: _.XT_ARRAY_INT,
                            value: [2, 3]
                        },
                        {
                            type: _.XT_SYMNAME,
                            value: "dim"
                        }
                    ]
                }
            },
            attr(
                [1, 2, 3, 4, 5, 6],
                {
                    dim: [2, 3]
                }
            ),
            done
        );
    });
    
    it ("supports matrix by row", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_INT,
                value: [1, 4, 2, 5, 3, 6],
                attr: {
                    type: _.XT_LIST_TAG,
                    value: [
                        {
                            type: _.XT_ARRAY_INT,
                            value: [2, 3]
                        },
                        {
                            type: _.XT_SYMNAME,
                            value: "dim"
                        }
                    ]
                }
            },
            attr(
                [1, 4, 2, 5, 3, 6],
                {
                    dim: [2, 3]
                }
            ),
            done
        );
    });
    
    it ("supports matrix with dimnames", function(done) {
        evaluatesTo(
            {
                type: _.XT_ARRAY_INT,
                value: [1, 2, 3, 4, 5, 6],
                attr: {
                    type: _.XT_LIST_TAG,
                    value: [
                        {
                            type: _.XT_ARRAY_INT,
                            value: [2, 3]
                        },
                        {
                            type: _.XT_SYMNAME,
                            value: "dim"
                        },
                        {
                            type: _.XT_VECTOR,
                            value: [
                                {
                                    type: _.XT_ARRAY_STR,
                                    value: ["r1", "r2"]
                                },
                                {
                                    type: _.XT_ARRAY_STR,
                                    value: ["c1", "c2", "c3"]
                                }
                            ]
                        },
                        {
                            type: _.XT_SYMNAME,
                            value: "dimnames"
                        }
                    ]
                }
            },
            attr(
                [1, 2, 3, 4, 5, 6],
                {
                    dim: [2, 3],
                    dimnames: [["r1", "r2"], ["c1", "c2", "c3"]]
                }
            ),
            done
        );
    });
    
    it ("supports dataframe", function(done) {
        evaluatesTo(
            {
                type: _.XT_VECTOR,
                value: [
                    {
                        type: _.XT_ARRAY_INT,
                        value: [1, 2]
                    },
                    {
                        type: _.XT_ARRAY_INT,
                        value: [1, 2],
                        attr: {
                            type: _.XT_LIST_TAG,
                            value: [
                                {
                                    type: _.XT_ARRAY_STR,
                                    value: ["red", "white"]
                                },
                                {
                                    type: _.XT_SYMNAME,
                                    value: "levels"
                                },
                                {
                                    type: _.XT_ARRAY_STR,
                                    value: ["factor"]
                                },
                                {
                                    type: _.XT_SYMNAME,
                                    value: "class"
                                }
                            ]
                        }
                    },
                    {
                        type: _.XT_ARRAY_BOOL,
                        value: [true, false]
                    }
                ],
                attr: {
                    type: _.XT_LIST_TAG,
                    value: [
                        {
                            type: _.XT_ARRAY_STR,
                            value: ["c.1..2.", "c..red....white..", "c.TRUE..FALSE."]
                        },
                        {
                            type: _.XT_SYMNAME,
                            value: "names"
                        },
                        {
                            type: _.XT_ARRAY_INT,
                            value: [null, -2]
                        },
                        {
                            type: _.XT_SYMNAME,
                            value: "row.names"
                        },
                        {
                            type: _.XT_ARRAY_STR,
                            value: ["data.frame"]
                        },
                        {
                            type: _.XT_SYMNAME,
                            value: "class"
                        }
                    ]
                }
            },
            attr(
                [
                    [1, 2],
                    attr(
                        [1, 2],
                        {
                            levels: ["red", "white"],
                            class: ["factor"]
                        }
                    ),
                    [true, false]
                ],
                {
                    names: ["c.1..2.", "c..red....white..", "c.TRUE..FALSE."],
                    "row.names": [null, -2], // see line 239 in REXP.java
                    class: ["data.frame"]
                }
            ),
            done
        );
    });
    
    
    after(function(done) {
        client.shutdown(null, function(err) {
            if (err) {
                throw err;
            }
            
            client.close();
            done();
        });
    });
});