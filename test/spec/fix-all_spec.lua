local test_utils = require("./test-utils")

describe("TypescriptFixAll", function()
    test_utils.setup()

    describe("bad async function", function()
        local content = [[
const mySyncFunc = () => console.log("hello");

const myAsyncFunc = () => await mySyncFunc();
        ]]
        local final = [[
const mySyncFunc = () => console.log("hello");

const myAsyncFunc = async () => await mySyncFunc();
        ]]

        describe("Lua API", function()
            it("adds async to non-async function", function()
                local assert_final = test_utils.setup_test_file("fix-all-async", content, final)

                require("typescript").actions.fixAll({ sync = true })

                assert_final()
            end)
        end)

        describe("Vim command", function()
            it("adds async to non-async function", function()
                local assert_final = test_utils.setup_test_file("fix-all-async", content, final)

                vim.cmd("TypescriptFixAll!")

                assert_final()
            end)
        end)
    end)

    describe("unreachable code", function()
        local content = [[
const myUnreachableFunc = () => {
  return "done";
  return "whoops";
};
        ]]
        local final = [[
const myUnreachableFunc = () => {
  return "done";
};
        ]]

        describe("Lua API", function()
            it("removes unreachable return statement", function()
                local assert_final = test_utils.setup_test_file("fix-all-unreachable", content, final)

                require("typescript").actions.fixAll({ sync = true })

                assert_final()
            end)
        end)

        describe("Vim command", function()
            it("removes unreachable return statement", function()
                local assert_final = test_utils.setup_test_file("fix-all-unreachable", content, final)

                vim.cmd("TypescriptFixAll!")

                assert_final()
            end)
        end)
    end)
end)
