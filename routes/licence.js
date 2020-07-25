const crypto = require("crypto");
var express = require("express");
const fs = require("fs");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
    r = {
        result: false,
        message: "",
    };

    if ("key" in req.query) {
        console.log(req.query.key);
        const buf = new Buffer(req.query.key, "hex");
        k = buf.toString("utf8").split("|");
        a = k[1];
        m = [];
        m.push(k[0].slice(0, 2));
        m.push(k[0].slice(2, 4));
        m.push(k[0].slice(11, 13));
        m.push(k[0].slice(13, 15));
        m.push(k[0].slice(22, 24));
        m.push(k[0].slice(24, 26));
        m = m.join(":");
        c = `${k[0].slice(4, 11)}${k[0].slice(15, 22)}${k[0].slice(26)}`;
        var mk = crypto.createDecipher(
            "aes-128-cbc",
            "Theres no place like home"
        );
        c = mk.update(c, "hex", "utf8");
        c += mk.final("utf8");
        let empresas = JSON.parse(fs.readFileSync("empresas.json"));
        if (c in empresas) {
            let v = empresas[c].validade.split("/");
            v = parseInt(`${v[2]}${v[1]}${v[0]}`);
            let cd = new Date();
            cd = cd.toISOString().slice(0, 10).split("-");
            cd = parseInt(`${cd[0]}${cd[1]}${cd[2]}`);
            if (v >= cd) {
                if (empresas[c].mac != m) {
                    if (empresas[c].inicial) {
                        empresas[c].mac = m;
                        empresas[c].inicial = false;
                    } else {
                        r.message = "Não autorizado!";
                    }
                }
                if (empresas[c].mac == m) {
                    if (empresas[c].acoes.indexOf(a) > -1) {
                        r.result = true;
                        r.message = "Autorizado!";
                    } else {
                        r.message = "Ação não autorizada!";
                    }
                }
            } else {
                r.message = "Licença expirada!";
            }
        } else {
            r.message = "Empresa não encontrada!";
        }
    }
    res.send(r);
});

module.exports = router;
