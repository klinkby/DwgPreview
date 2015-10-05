/* jslint browser: true */
/*!
 * Validates license for Office Store app.
 * Copyright (c) 2015 Mads Breusch Klinkby.
 * GPLv3 license: https://www.gnu.org/licenses/gpl-3.0.html
 */
(function () {
    "use strict";

    function getQueryStringValue(key) {
        var res = new RegExp("(?:[\?&]" + encodeURIComponent(key) + "=)([^&]+)").exec(location.search);
        return null !== res && 2 === res.length ? decodeURIComponent(res[1]) : null;
    }

    function getResources(language) {
        var l10n = {
            "da-DK": {
                couldNotLoad: "Kunne ikke få licens oplysninger fra SharePoint",
                couldNotVerify: "Kunne ikke få licens oplysninger fra Office Verification Service",
                emptyResponse: "Fik et tomt svar fra Office Verifikation service",
                noLicense: "Ingen licensinformation tilgængelig",
                trialExpired: "Din prøveperiode er udløbet. For at fortsætte med at bruge Appen, skal du købe en licens i <a href='//store.office.com/search.aspx?qu=klinkby'>Office store</a>.",
                unexpectedToken: "Uventet licens token."
            },
            "de-DE": {
                couldNotLoad: "Konnte nicht lizenzieren Informationen aus Sharepoint erhalten",
                couldNotVerify: "Konnte nicht lizenzieren Informationen aus Office Verification Service erhalten",
                emptyResponse: "Habe eine leere Antwort vom Office Verification Service",
                noLicense: "Keine Lizenz info verfügbar",
                trialExpired: "Ihre Probezeit ist abgelaufen. Zur weiteren Nutzung der Software, kaufen Sie bitte eine Lizenz im <a href='//store.office.com/search.aspx?qu=klinkby'>Office store</a>.",
                unexpectedToken: "Unerwartete Lizenz-Token."
            },
            "en-GB": {
                couldNotLoad: "Could not get license information from SharePoint",
                couldNotVerify: "Could not get license information from Office Verification Service",
                emptyResponse: "Got an empty response from Office Verification Service",
                noLicense: "No license info available",
                trialExpired: "Your trial has expired. To continue using the App, please purchase a license in the  <a href='//store.office.com/search.aspx?qu=klinkby'>Office store</a>.",
                unexpectedToken: "Unexpected license token."
            },
            "en-US": {
                couldNotLoad: "Could not get license information from SharePoint",
                couldNotVerify: "Could not get license information from Office Verification Service",
                emptyResponse: "Got an empty response from Office Verification Service",
                noLicense: "No license info available",
                trialExpired: "Your trial has expired. To continue using the App, please purchase a license in the  <a href='//store.office.com/search.aspx?qu=klinkby'>Office store</a>.",
                unexpectedToken: "Unexpected license token."
            },
            "es-ES": {
                couldNotLoad: "No se pudo obtener la licencia de la información de SharePoint",
                couldNotVerify: "No se pudo obtener la licencia de la información de Office Verification Service",
                emptyResponse: "Conseguí una respuesta vacía de la Office Verification Service",
                noLicense: "No hay información de licencia disponible",
                trialExpired: "Su período de prueba ha caducado. Para seguir utilizando el software, por favor, comprar una licencia en la <a href='//store.office.com/search.aspx?qu=klinkby'>Office store</a>.",
                unexpectedToken: "Símbolo licencia inesperado."
            },
            "fr-FR": {
                couldNotLoad: "Impossible de se informations sur la licence de SharePoint",
                couldNotVerify: "Impossible de se informations sur la licence de Office Verification Service",
                emptyResponse: "Reçu une réponse vide de la Office Verification Service",
                noLicense: "Pas d'infos de licence disponible",
                trialExpired: "Votre période d'essai a expiré. Pour continuer à utiliser le Logiciel, s'il vous plaît acheter une licence dans le <a href='//store.office.com/search.aspx?qu=klinkby'>Office store</a>.",
                unexpectedToken: "Jeton de licence Inconnu."
            },
            "nn-NO": {
                couldNotLoad: "Kunne ikke få lisens informasjon fra Sharepoint",
                couldNotVerify: "Kunne ikke få lisens informasjon fra Office Verification Service",
                emptyResponse: "Mottatt et tomt svar fra Office Verification Service",
                noLicense: "Ingen lisens info tilgjengelig",
                trialExpired: "Prøveperioden er utløpt. For å fortsette å bruke programvaren, må du kjøpe en lisens i <a href='//store.office.com/search.aspx?qu=klinkby'>Office store</a>.",
                unexpectedToken: "Uventet token lisens."
            },
            "sv-SE": {
                couldNotLoad: "Det gick inte att gå licens information från Sharepoint",
                couldNotVerify: "Det gick inte att gå licens information från Office Verification Service",
                emptyResponse: "Fick en tom svar från Office Verification Service",
                noLicense: "Ingen licens info finns",
                trialExpired: "Provperioden har löpt ut. För att fortsätta använda programvaran, köpa en licens i <a href='//store.office.com/search.aspx?qu=klinkby'>Office store</a>.",
                unexpectedToken: "Oväntad licens token."
            }
        };
        return l10n[lang] || l10n["en-US"]
    }

    var productId = "{3f556c03-fcac-43a6-8805-67203223ca90}", // from AppManifest.xml
        lang = getQueryStringValue("SPLanguage"),
        resx = getResources(lang),
        storage = window.sessionStorage,
        key = productId,
        elements = {
            licenseMessage: document.getElementById("licenseMessage")
        };

    function setLicenseValid() {
        storage.setItem(key, productId);
        document.body.className += " license-valid";
    }

    function setLicenseInvalid(reason) {
        storage.setItem(key, reason);
        if (null !== elements.licenseMessage) {
            elements.licenseMessage.innerHTML = reason;
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
            setLicenseInvalid(resx.noLicense);
            return;
        }
        if ("Trial" === entitlementType) {
            expiryDate = new Date(getXmlElementText("EntitlementExpiryDate", xmlToken));
            if (expiryDate < new Date()) {
                setLicenseInvalid(resx.trialExpired);
                return;
            }
            setLicenseValid();
            return;
        }
        if ("Paid" === entitlementType || "Free" === entitlementType) {
            setLicenseValid();
            return;
        }
        setLicenseInvalid(resx.unexpectedToken);
    }

    function validateLicenseCollection(licenses) {
        var topLicense,
            encodedTopLicense,
            proxyRequest,
            proxyResponse,
            ctx;

        if (0 === licenses.get_count()) {
            setLicenseInvalid(resx.noLicense);
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
                setLicenseInvalid(resx.emptyResponse);
                return;
            }
            validateLicenseToken(xmlToken);
        }, function () {
            setLicenseInvalid(resx.couldNotVerify);
        });
    }

    function fetchAppLicenseInfo() {
        var ctx = window.SP.ClientContext.get_current(),
            licenses = window.SP.Utilities.Utility.getAppLicenseInformation(ctx, productId);
        ctx.executeQueryAsync(function () {
            validateLicenseCollection(licenses);
        }, function () {
            setLicenseInvalid(resx.couldNotLoad);
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

    window.ExecuteOrDelayUntilScriptLoaded(validateProducticense, "sp.js");
}());