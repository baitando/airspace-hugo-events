const gdpr = {
    hooks: [],
    optIn: 'optIn',
    optOut: 'optOut',

    register: function (name, callback) {
        if ('undefined' === typeof (gdpr.hooks[name])) {
            gdpr.hooks[name] = [];
        }
        gdpr.hooks[name].push(callback)
    },

    populateEvent: function (eventName) {
        if ('undefined' !== typeof (gdpr.hooks[eventName]))
            for (let i = 0; i < gdpr.hooks[eventName].length; ++i)
                if (true !== gdpr.hooks[eventName][i](arguments)) {
                    break;
                }
    }
};

window.addEventListener("load", function () {
    window.cookieconsent.initialise({
        "palette": {
            "popup": {
                "background": "#000"
            },
            "button": {
                "background": "#f1d600"
            }
        },
        "content": gdprSettings,
        "position": "bottom-right",
        "type": "opt-in",
        onInitialise: function () {
            const type = this.options.type;
            const didConsent = this.hasConsented();
            if (type === 'opt-in' && didConsent && !doNotTrackEnabled()) {
                optIn(false);
            } else {
                optOut(false);
            }
        },

        onStatusChange: function () {
            const type = this.options.type;
            const didConsent = this.hasConsented();
            if (type === 'opt-in' && didConsent && !doNotTrackEnabled()) {
                optIn(true);
            }
        },
        onRevokeChoice: function () {
            const type = this.options.type;
            if (type === 'opt-in') {
                optOut(true);
            }
        }
    })
});

function optIn(reload = false) {
    gdpr.populateEvent(gdpr.optIn);

    if (reload) {
        window.location.reload(true);
    }
}

function optOut(reload = false) {
    gdpr.populateEvent(gdpr.optOut);
    deleteAllCookies();

    if (reload) {
        window.location.reload(true);
    }
}

function doNotTrackEnabled() {
    return navigator.doNotTrack === "1" || navigator.doNotTrack === "yes" || window.doNotTrack === "1";
}

function deleteAllCookies() {
    // Deletes all cookies except the one which is used to store the cookie consent status
    // Taken from https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
    const cookies = document.cookie.split("; ");
    for (let c = 0; c < cookies.length; c++) {
        console.log("cookie: " + cookies[c]);
        if (!cookies[c].includes("cookieconsent_status")) {
            const d = window.location.hostname.split(".");
            while (d.length > 0) {
                const cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) +
                    '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
                const p = location.pathname.split('/');
                document.cookie = cookieBase + '/';
                while (p.length > 0) {
                    document.cookie = cookieBase + p.join('/');
                    p.pop();
                }
                d.shift();
            }
        }
    }
}