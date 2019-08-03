function MyFunctions() {
    this.validateNum = (input) => {
        var reg = /^\d+$/;
        return reg.test(input) || "Input must be a number."
    }
}

exports.module = MyFunctions;