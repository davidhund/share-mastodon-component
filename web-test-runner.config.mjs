export default {
	files: ["test/**/*.test.js"],
	nodeResolve: true,
	browserStartTimeout: 60000,
	testsFinishTimeout: 120000,
	testFramework: {
		config: {
			timeout: "10000",
		},
	},
};
