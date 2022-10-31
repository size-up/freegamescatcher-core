import { version } from "../../src/config/application.config";
import packageJson from "../../package.json";

describe("Test application configuration", () => {
    it(`given application version is undefined,
    when get version,
    then version is the default package.json version`, async () => {
        // given
        process.env.NODE_ENV = undefined;
        process.env.VERSION = undefined;

        // when
        const result = version();

        // then
        expect(result).toEqual(packageJson.version);
    });

    it(`given application version is not production,
    when get version,
    then version is the default package.json version`, async () => {
        // given
        process.env.NODE_ENV = "development";
        process.env.VERSION = "1.0.0";

        // when
        const result = version();

        // then
        expect(result).toEqual(packageJson.version);
    });

    it(`given application version is production,
    when get version,
    then version is equal to the VERSION env. variable`, async () => {
        // given
        process.env.NODE_ENV = "production";
        process.env.VERSION = "1.0.0";

        // when
        const result = version();

        // then
        expect(result).not.toEqual(packageJson.version);
        expect(result).toEqual("1.0.0");
    });
});
