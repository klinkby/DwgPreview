/* jslint browser: true */
/*!
 * Validates license for Office Store app.
 * Copyright (c) 2015 Mads Breusch Klinkby.
 * GPLv3 license: https://www.gnu.org/licenses/gpl-3.0.html
 */
(function () {
    "use strict";

    var productId = "{3f556c03-fcac-43a6-8805-67203223ca90}",
        storage = window.sessionStorage,
        key = "appLicense";

    function setLicenseValid() {
        storage.setItem(key, productId);
        document.body.className += " license-valid";
    }

    function setLicenseInvalid(reason) {
        var el = document.getElementById("licenseMessage");
        storage.setItem(key, reason);
        if (null !== el) {
            el.innerHTML = reason;
        }
        document.body.className += " license-invalid";
    }

    function getXmlElementText(elementName, xml) {
        var regExp = new RegExp("(?:\\<" + elementName + "\\>\\s*)([\\w\\W]+?)(?:\\s*\\<\\/" + elementName + "\\>)"),
            match = regExp.exec(xml);
        if (null === match) {
            return null;
        }
        return match[1];
    }

    function validateLicenseToken(xmlToken) {
        var licenseProductId = getXmlElementText("ProductId", xmlToken),
            isValid = "true" === getXmlElementText("IsValid", xmlToken),
            entitlementType = getXmlElementText("EntitlementType", xmlToken),
            expiryDate;
        if (licenseProductId !== productId || !isValid) {
            setLicenseInvalid("Invalid license");
            return;
        }
        if ("Trial" === entitlementType) {
            expiryDate = new Date(getXmlElementText("EntitlementExpiryDate", xmlToken));
            if (expiryDate < new Date()) {
                setLicenseInvalid("Unfortunately your trial has expired. Purchase a license for the app in the Office store to keep using using it.");
                return;
            }
            setLicenseValid();
            return;
        }
        if ("Paid" === entitlementType || "Free" === entitlementType) {
            setLicenseValid();
            return;
        }
        setLicenseInvalid("Unexpected license token.");
    }

    function validateLicenseCollection(licenses) {
        var topLicense,
            encodedTopLicense,
            proxyRequest,
            proxyResponse,
            ctx;

        if (0 === licenses.get_count()) {
            setLicenseInvalid("No license");
            return;
        }
        topLicense = licenses.get_item(0).get_rawXMLLicenseToken();
        encodedTopLicense = encodeURIComponent(topLicense);

        proxyRequest = new window.SP.WebRequestInfo();
        proxyRequest.set_url("https://verificationservice.officeapps.live.com/ova/verificationagent.svc/rest/verify?token=" + encodedTopLicense);
        proxyRequest.set_method("GET");
        ctx = window.SP.ClientContext.get_current();
        proxyResponse = SP.WebProxy.invoke(ctx, proxyRequest);
        ctx.executeQueryAsync(function () {
            var xmlToken = proxyResponse.get_body();
            if (null === xmlToken) {
                setLicenseInvalid("Got an empty response from Office Verification Service");
                return;
            }
            validateLicenseToken(xmlToken);
        }, function () {
            setLicenseInvalid("Could not get license information from Office Verification Service");
        });
    }

    function fetchAppLicenseInfo() {
        var ctx = window.SP.ClientContext.get_current(),
            licenses = window.SP.Utilities.Utility.getAppLicenseInformation(ctx, productId);
        ctx.executeQueryAsync(function () {
            validateLicenseCollection(licenses);
        }, function () {
            setLicenseInvalid("Could not get license information from SharePoint");
        });
    }

    function validateProducticense() {
        var value = storage.getItem(key);
        if (productId === value) {
            setLicenseValid();
        } else if (!value) {
            fetchAppLicenseInfo();
        } else {
            setLicenseInvalid(value);
        }
    }

    window.ExecuteOrDelayUntilScriptLoaded(function () {
        validateProducticense();
    }, "sp.js");

}());