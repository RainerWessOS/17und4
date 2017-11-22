//*******************************************************************
//      Daddelkiste Disco Points Version 0.91 
//      Javascript implementation of a penny arcade casino game
//
//      Copyright (C) 2017 Rainer Wess, Osnabrück, Germany
//      Open Source / Freeware - released under GPL 2.0
//*******************************************************************

var geld = 0;
var einsatz = 20;
var punkte = 0;
var gewinn = 0;

// Variablen für Scheibenpositionen, Zufallszahl von 1 bis 12 (0 löscht Scheibe)
var s1 = 0; // left disc
var s2 = 0; // disc in the middle
var s3 = 0; // right disc
var s_stop = 1; // Zählvariable fürs stoppen der Scheiben per Stop-Taste

// Definition der Scheibenbelegung
// 999 = Sonne
var disc = new Array();
disc[0] = [0, 999, 30, 120, 30, 999, 30, 60, 30, 999, 30, 120, 30]; // links oben
disc[1] = [0, 999, 20, 80, 20, 160, 20, 40, 20, 40, 80, 20, 40]; // links unten
disc[2] = [0, 999, 20, 30, 60, 30, 160, 20, 40, 30, 80, 20, 120]; // mitte
disc[3] = [0, 999, 30, 120, 30, 999, 30, 60, 30, 999, 30, 120, 30]; // rechts oben
disc[4] = [0, 999, 20, 80, 20, 160, 20, 40, 20, 40, 80, 20, 40]; // rechts unten

// Aus gs die Punkte ermitteln
var gpu = [0, 30, 60, 120, 240, 500, 1000, 2000, 4000, 9000, 0, 20, 40, 80, 160, 300, 600, 1200, 2500, 5000, 10000];

// Ausspielreihenfolge GA rechts(4-9)/links(15-20)/mitte(21-28)
var arf = [0, 0, 0, 0, 4, 8, 6, 9, 5, 7, 0, 0, 0, 0, 0, 15, 19, 17, 20, 16, 18, 21, 26, 23, 28, 24, 27, 22, 25];

var gs = 0; // Gewinnstufe, Kern der Risikofunktion, 0-9 fur rechts, 10-20 links
var rsr = 5; // Risikostufe rechts, default Wert, bis zum Erreichen von 500 Punkten
var rsl = 15; // Risikostufe links, default Wert, bis zum Erreichen von 300 Punkten

// *****************
// Boolsche Variablen
var startautomatik = false; // Startet automatisch das nächste Spiel
var autostart = false; // startet die erste Scheibe nochmal, wenn keine Sonne
var risikoautomatik = false;

var win = false; // Zufallsvariable, bestimmt ob risiko erfolgreich
var riskiert = false; // true wenn Risikotaste während Risikophase gedrückt wurde
// und in dem Bereich in dem die Risikoautomatik aktiv ist
var risikophase = false;
var spiel_laueft_noch = false; // ist praktisch während des ganzen Spiels true, geht nur unmittelbar
// vor start des nächsten Spiels kurz auf false, verhindert Mehrfachstarts
var teilgewinn_angenommen = false; // entprellt und verzoegert das Herunterteilen
var gewinn_angenommen = false; // verhintert das mehrfache Annehmen eines Gewinnes
var hoechststufe = false; // Bei Höchstgewinn bleibt Gerät trotz Automatikstart stehen bis START gedrückt wird
//  steuert Animation und Sound bei Gewinn von 90 und 100 Sonderspielen
var ausspielung = false; // dient zum stoppen von allen Ausspielungen
var ga = false; // true bei grossen Ausspielungen, wird benotigt wegen Ausspielreihenfolge arf

var counter = 0; // wird fur die Risikoautomatik und automatische Gewinnannahme verwendet
var ns = 0; // Null Selektor in Risikophase (rechte oder linke Null)
var pu_neu = 0;
var pu_hoch = 0; // wird fürs hochzählen der Punkte benötigt
var intHoch; // Interval wird fürs hochzählen der Punkte benötigt
var lo = true; // fur Lichtanimation bei Hoechststufe
var intH; // Interval fur Lichtanimation bei Hoechststufe
var gam = 0; // Gewinn-Feldnummer bei der großen Ausspielung mitte (21-28)

// ************************
// Variablen die über Einstelldialog einstellbar sind:
var risiko_win = 50; // Prozent für Gewinn bei Risiko, default 50 (Risiko 1:1)
// dieser Wert kann nach eigenem Geschmack verändert werden
// bei Erhöhung des Wertes läßt sich leichter Hochdrücken
var spiel_tempo = 100; // Geschwindigkeit des Spielablaufs (50,75,100,125,150)
var auto_risiko = 4; // nach wieviel Sekunden Risikoautomatik
// auto_risiko muss kleiner sein als auto_annahme!!!
var auto_annahme = 6; // nach wieviel Sekunden automatische Gewinnannahme
// *****************
// Farbdefinitionen für die Tasten
var btn_rot_aus = "#990000"; // Farbe der roten Button passiv
var btn_rot_auto = "#BB0000"; // Farbe der roten Button bei Automatik
var btn_rot_an = "#FF0000"; // Farbe der roten Button aktiv
var btn_gelb_aus = "#997A00"; // Farbe der gelben Risiko-Buttons passiv
var btn_gelb_auto = "#CCA300"; // Farbe der gelben Button bei Automatik
var btn_gelb_an = "#FFCC00"; // Farbe der gelben Risiko-Buttons aktiv
var btn_gruen_aus = "#006600";
var btn_gruen_an = "#009900";

// nützliche kleine Helfer Funktionen

function id(id) {
	return document.getElementById(id);
}

function bgImg(n, i) {
	return id("feld" + n).style.backgroundImage = "url(" + Risiko[i].src + ")";
}

function hide(id) {
	id(id).style.visibility = "hidden";
}

function show(id) {
	id(id).style.visibility = null;
}

function button_text(bid, btxt) {
	id(bid).value = btxt;
}

function button_color(bid, bcolor) {
	id(bid).style.backgroundColor = bcolor;
}

function setInfo(txt) {
	id("Info").innerHTML = txt;
}

function setPF(pid, ptxt) {
	id(pid).innerHTML = ptxt;
}

// Multi-Language
function setPFtxt() {
	setPF("Art", playfield[0]);
	setPF("Typ", playfield[1]);
	setPF("a1", playfield[2]);
	setPF("a2", playfield[3]);
	setPF("a3", playfield[4]);
	setPF("a4", playfield[5]);
	setPF("gar", playfield[8]);
	setPF("gal", playfield[8]);
	setPF("pl1", playfield[8]);
	setPF("pl2", playfield[8]);
}

// Multi-Language
function setConfTxt() {
	setPF("c1a", settingsText[0]);
	setPF("c1b", settingsText[0]);
	setPF("c1c", settingsText[0]);
	setPF("c1d", settingsText[0]);
	setPF("c1", settingsText[0]);
	setPF("winning", settingsText[1]);
	setPF("speed", settingsText[2]);
	setPF("r_auto", settingsText[3]);
	setPF("t_auto", settingsText[4]);
	setPF("c2a", settingsText[6]);
	setPF("c2b", settingsText[6]);
	setPF("c2c", settingsText[6]);
	setPF("c2d", settingsText[6]);
	setPF("c2", settingsText[6]);
	setPF("c3a", settingsText[7]);
	setPF("c3b", settingsText[7]);
	setPF("c3c", settingsText[7]);
	setPF("c3d", settingsText[7]);
	setPF("c3", settingsText[7]);
	setPF("c4a", settingsText[8]);
	setPF("c4b", settingsText[8]);
	setPF("c4c", settingsText[8]);
	setPF("c4d", settingsText[8]);
	setPF("c4", settingsText[8]);
	setPF("c_anl", c_anl);
	setPF("c_hint", c_hint);
	setPF("c_think", c_think);
	setPF("c_github", c_github);

}

// Multi-Language
function setBtnTxt() {
	button_text("start_button", btnText[0]);
	button_text("mitte_button", btnText[1]);
	button_text("stop_button", btnText[2]);
	button_text("risiko_button1", btnText[3]);
	button_text("risiko_button2", btnText[3]);
	button_text("geldeinwurf", btnText[6]);
	button_text("cfg_button", btnText[7]);
	button_text("exit1", btnText[8]);
	button_text("exit2", btnText[8]);
	button_text("exit3", btnText[8]);
	button_text("exit4", btnText[8]);
}

function saveSettings() {
	// Check browser support
	if (typeof(Storage) !== "undefined") {
		// Store
		localStorage.setItem("risiko_win", String(risiko_win));
		localStorage.setItem("spiel_tempo", String(spiel_tempo));
		localStorage.setItem("auto_risiko", String(auto_risiko));
		localStorage.setItem("auto_annahme", String(auto_annahme));
		setInfo(infoText[0]);
	}
	else setInfo("Could not save settings");

}

function loadSettings() {

	if (localStorage.risiko_win) {
		risiko_win = Number(localStorage.risiko_win);
	}
	if (localStorage.spiel_tempo) {
		spiel_tempo = Number(localStorage.spiel_tempo);
	}
	if (localStorage.spiel_tempo) {
		auto_risiko = Number(localStorage.auto_risiko);
	}
	if (localStorage.spiel_tempo) {
		auto_annahme = Number(localStorage.auto_annahme);
	}

	id("risiko_win").value = risiko_win;
	id("rw").value = String(risiko_win) + " %";
	id("spiel_tempo").value = spiel_tempo;
	id("spt").value = String(spiel_tempo) + " %";
	id("auto_risiko").value = auto_risiko;
	id("ar").value = String(auto_risiko) + settingsText[5];
	id("auto_annahme").value = auto_annahme;
	id("aga").value = String(auto_annahme) + settingsText[5];
}

function blinkGal() {
	gal.className = "ausspielung1";
}

function blinkGar() {
	gar.className = "ausspielung1";
}

function resetA() {
	gal.className = "ausspielung";
	gar.className = "ausspielung";
}

function zum_starten_auffordern() {
	setInfo(infoText[3]);
}

function zeige_Geld() {
	id("Geld").value = String(geld) + ".00";
}

function zeige_Punkte() {
	id("Punkte").value = String(punkte);
}

function zeige_Gewinn() {
	id("Gewinn").value = String(gewinn);
}

function zeige_Einsatz() {
	id("Einsatz").value = String(einsatz);
}

function zeige_feld(nr, status) {

	if (risikoautomatik && (nr == rsr || nr == rsl)) { // Bild mit grunem Balken 
		if (status == 1) bgImg(nr, 3);
		else bgImg(nr, 2);
	}
	else { // ohne grünen Balken
		if (status == 1) bgImg(nr, 1);
		else bgImg(nr, 0);
	}
}

function zeige_felder(von, bis, status) {
	// z.B (0,9,0) schaltet die Felder (von 0, bis 9, aus 0)

	for (i = von; i <= bis; i++) {
		zeige_feld(i, status);
	}
}

function lichtorgel() {

	lo = (lo) ? false : true;

	for (i = 0; i <= 20; i++) {
		if (lo) {
			(i % 2 == 0) ? zeige_feld(i, 1): zeige_feld(i, 0);
		}
		else {
			(i % 2 == 0) ? zeige_feld(i, 0): zeige_feld(i, 1);
		}
	}
}

function ausspiel_stop() {
	ausspielung = false;
}

function reset() {

	// setzt die Formularfelder neu, die bei einem reload der Webseite
	// sonst mit falschen Werten gefüllt bleiben

	setInfo(infoText[1]);
	geld = 0;
	zeige_Geld();
	punkte = 0;
	zeige_Punkte();
	gewinn = 0;
	zeige_Gewinn();

	loadSettings();
	// For localisation de, en usw.
	setBtnTxt();
	setPFtxt();
	setConfTxt();
}

function zufallszahl(min, max) {

	// liefert tatsächlich gleichverteilte Zufallszahlen
	// var x = Math.floor(Math.random() * (max - min + 1)) + min;
	// siehe: http://aktuell.de.selfhtml.org/artikel/javascript/zufallszahlen/

	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function win_or_loose() {

	return (zufallszahl(1, 100) <= risiko_win) ? true : false;
}

function Geld_zu_Punkte() {

	punkte = punkte + geld * 100;
	geld = 0;
	zeige_Punkte();
	zeige_Geld();

	if (!spiel_laueft_noch) {
		setTimeout("zum_starten_auffordern();", 3 * spiel_tempo);
		setTimeout("button_color('start_button', btn_rot_an);", 3 * spiel_tempo);
	}
}

function umbuchen_animieren2() {

	id("Punkte").value = "> > " + String(punkte);
	setTimeout("Geld_zu_Punkte()", 8 * spiel_tempo);
}

function umbuchen_animieren1() {

	id("Punkte").value = "> >   " + String(punkte);
	setInfo(infoText[2]);
	setTimeout("umbuchen_animieren2()", 8 * spiel_tempo);
}

function Geldeinwurf() {

	geld = geld + 10;
	zeige_Geld();
	button_color("geldeinwurf", btn_gruen_aus);
	setTimeout("umbuchen_animieren1()", 8 * spiel_tempo);
}

function zeige_Scheibe(i, position) {

	audio_stop();
	id("scheibe" + i).src = Scheibe[i][position].src;
	if (i != 2) id("scheibe" + (i + 1)).src = Scheibe[i + 1][position].src;
	if (position != 0) audio_play("walzenstop");
	// position = 0 entspricht  Scheibe löschen, leeres Bild
}

function stop_Scheibe_1() {

	if (s_stop == 1) {
		s_stop++;
		s1 = zufallszahl(1, 12);
		zeige_Scheibe(0, s1);

		// Falls Autostart eingeschaltet und auf Scheibe1 keine Sonne
		if (autostart && !(s1 == 1 || s1 == 5 || s1 == 9)) {
			setTimeout("zeige_Scheibe(0, 0);", 7 * spiel_tempo);
			s1 = zufallszahl(1, 12);
			setTimeout("zeige_Scheibe(0, s1);", 15 * spiel_tempo);
		}
		setTimeout("stop_Scheibe_3()", 10 * spiel_tempo);
	}
}

function stop_Scheibe_2() {

	if (s_stop == 3) {
		s_stop++;
		s2 = zufallszahl(1, 12);
		zeige_Scheibe(2, s2);
		button_color("stop_button", btn_rot_aus);
		setTimeout("Gewinnermittlung();", 10 * spiel_tempo);

	}
}

function stop_Scheibe_3() {

	if (s_stop == 2) {
		s_stop++;
		s3 = zufallszahl(1, 12);
		zeige_Scheibe(3, s3);
		setTimeout("stop_Scheibe_2()", 15 * spiel_tempo);
	}
}

function Scheiben_loeschen() {

	for (var i = 0; i <= 4; i++) {
		id("scheibe" + i).src = Scheibe[i][0].src;
	}
	button_color("stop_button", btn_rot_an);
	setTimeout("stop_Scheibe_1()", 15 * spiel_tempo);
}

function Hoechststufe_erreicht() {

	hoechststufe = true;
	button_color("mitte_button", btn_rot_aus);
	audio_play("hauptgewinn");

	intH = setInterval(lichtorgel, 800);
	setTimeout("Gewinn_annehmen();", 8 * spiel_tempo);

}

function Hoechststufe_zurueck() {

	hoechststufe = false;
	clearInterval(intH);

	audio_stop();

}

function starte_Spiel() {

	risikophase = false;
	gewinn_angenommen = false;
	s_stop = 1;
	gs = 0;
	gewinn = 0;
	spiel_tempo = id("spiel_tempo").value;

	if (punkte >= einsatz) {

		spiel_laueft_noch = true;
		punkte = punkte - einsatz;
		zeige_Punkte();
		audio_play("abbuchen");
		setInfo(" ");

		zeige_felder(0, 20, 0);

		if (hoechststufe) Hoechststufe_zurueck();

		if (startautomatik) button_color("start_button", btn_rot_auto);
		else button_color("start_button", btn_rot_aus);

		if (risikoautomatik) {
			zeige_feld(rsr, 0);
			zeige_feld(rsl, 0);
		}

		setTimeout("Scheiben_loeschen()", spiel_tempo);
	}
	else {
		setInfo(infoText[1]);
		button_color("geldeinwurf", btn_gruen_an);
	}
}

function starttaste_gedrueckt() {

	if (spiel_laueft_noch) {
		if (startautomatik) {
			startautomatik = false;
			button_color("start_button", btn_rot_aus);
			setInfo(infoText[4]);
		}
		else {
			startautomatik = true;
			button_color("start_button", btn_rot_auto);
			setInfo(infoText[5]);
		}
	}
	else if (!spiel_laueft_noch) starte_Spiel();
}

function mittleretaste_gedrueckt() {

	if (!risikophase) {
		if (autostart) {
			autostart = false;
			button_color("mitte_button", btn_rot_aus);
			setInfo(infoText[6]);
		}
		else {
			autostart = true;
			button_color("mitte_button", btn_rot_auto);
			setInfo(infoText[7]);
		}
	}
	else Teilgewinn_annehmen();
}

function stoptaste_gedrueckt() {

	if (ausspielung) ausspiel_stop();
	else if (risikophase) Gewinn_annehmen();
	else {
		stop_Scheibe_2();
		stop_Scheibe_3();
		stop_Scheibe_1();
	}
}

function risikotaste_gedrueckt() {

	if (!risikophase) {
		if (risikoautomatik) {
			risikoautomatik = false;
			zeige_feld(rsr, 0);
			zeige_feld(rsl, 0);
			button_color("risiko_button1", btn_gelb_aus);
			button_color("risiko_button2", btn_gelb_aus);
			setInfo(infoText[8]);
		}
		else {
			risikoautomatik = true;
			setze_risikostufe(5);
			setze_risikostufe(15);
			button_color("risiko_button1", btn_gelb_auto);
			button_color("risiko_button2", btn_gelb_auto);
			setInfo(infoText[9]);
		}
	}
	else riskiert = true;
}

function risiko_auto() {

	// Bedingungen notwendig wegen zeitverzögertem Auslösen
	// kann sich inzwischen geändert haben
	if (risikoautomatik && !gewinn_angenommen) riskiert = true;

}

function setze_risikostufe(rs) {

	var rsa;

	if (risikoautomatik) {
		if (rs < 10) {
			rsa = rsr;
			rsr = rs;
			setInfo(infoText[10]);
		}
		else {
			rsa = rsl;
			rsl = rs;
			setInfo(infoText[11]);
		}
		zeige_feld(rsa, 0);
		zeige_feld(rs, 0);
	}
}

function the_end() {

	risikophase = false;

	audio_stop();

	if (autostart) button_color("mitte_button", btn_rot_auto);
	else button_color("mitte_button", btn_rot_aus);
	button_text("mitte_button", btnText[1]);

	button_color("stop_button", btn_rot_aus);
	button_text("stop_button", btnText[2]);

	if (risikoautomatik) {
		button_color("risiko_button1", btn_gelb_auto);
		button_color("risiko_button2", btn_gelb_auto);
	}
	else {
		button_color("risiko_button1", btn_gelb_aus);
		button_color("risiko_button2", btn_gelb_aus);
	}

	spiel_laueft_noch = false;

	if (punkte < einsatz) {
		button_color("geldeinwurf", btn_gruen_an);
		setTimeout("setInfo(infoText[1]);", 10 * spiel_tempo);
	}
	else if (startautomatik && !hoechststufe) {
		starte_Spiel();
	}
	else {
		button_color("start_button", btn_rot_an);
		zum_starten_auffordern();
	}
}

function Punkte_hochzaehlen() {

	if (pu_neu > pu_hoch) {
		pu_hoch = pu_hoch + 10;
		punkte = punkte + 10;
		zeige_Punkte();
	}

	else {
		clearInterval(intHoch);

		gewinn = gewinn - pu_neu;
		zeige_Gewinn();
		audio_play("angenommen");
		// Volle Gewinnannahme
		if (gewinn == 0 && !ausspielung) {
			setInfo(infoText[12] + pu_neu + infoText[14]);
			pu_neu = 0;
			setTimeout("the_end();", 20 * spiel_tempo);
		} // Teilgewinnannahme
		else if (gewinn > 0) {
			zeige_feld(gs + 1, 0);
			zeige_feld(gs, 0);
			gs = gs - 1;
			zeige_feld(gs, 1);
			setInfo(infoText[13] + pu_neu + infoText[14]);
			pu_neu = 0;
			setTimeout("starte_risiko();", 20 * spiel_tempo);
		}

	}
}

function Gewinn_annehmen() {

	if (!gewinn_angenommen && !(gs == 0 || gs == 10)) {
		gewinn_angenommen = true;
		button_color("stop_button", btn_rot_aus);
		if (!hoechststufe) audio_stop();

		zeige_Gewinn();
		pu_hoch = 0;
		pu_neu = gpu[gs];
		intHoch = setInterval(Punkte_hochzaehlen, 10);

	}
}

function Teilgewinn_annehmen() {

	if (!teilgewinn_angenommen) {

		if (gewinn_angenommen) {
			setInfo(infoText[16]);
		}
		else if (gs == 0 || gs == 10) {
			setInfo(infoText[17]);
		}
		else if (gs == 1 || gs == 11) {
			setInfo(infoText[18]);
		}
		else if (hoechststufe) {
			setInfo(infoText[19]);
		}
		else if (!gewinn_angenommen) {
			audio_stop();
			teilgewinn_angenommen = true;
			pu_neu = gpu[gs] - gpu[gs - 1];
			pu_hoch = 0;

			intHoch = setInterval(Punkte_hochzaehlen, 10);
		}
	}
}

function starte_risiko() {

	risikophase = true;
	riskiert = false;
	counter = 0;

	audio_stop();
	risiko_win = id("risiko_win").value;
	auto_risiko = id("auto_risiko").value;
	auto_annahme = id("auto_annahme").value;

	gewinn = gpu[gs];
	zeige_Gewinn();

	if (gs == 0 || gs == 10) {
		setTimeout("the_end();", 20 * spiel_tempo);
	}

	win = win_or_loose();

	button_text("stop_button", btnText[5]);

	if (gs == 9 || gs == 20) {
		button_color("stop_button", btn_rot_an);
		Hoechststufe_erreicht();
	}
	else if (((0 < gs && gs < 9) || (10 < gs && gs < 20)) && !gewinn_angenommen) {

		button_color("risiko_button1", btn_gelb_an);
		button_color("risiko_button2", btn_gelb_an);
		button_text("mitte_button", btnText[4]);
		button_color("stop_button", btn_rot_an);

		if ((1 < gs && gs < 9) || (11 < gs && gs < 20)) {
			button_color("mitte_button", btn_rot_an);
		}
		else button_color("mitte_button", btn_rot_aus);

		animiere_risiko();
	}

}

function animiere_risiko() {

	rfeld = gs + 1;
	zeige_feld(gs, 0);

	ns = (gs > 10) ? 10 : 0;

	if (counter % 2 == 0) zeige_feld(ns, 0);
	else zeige_feld(rfeld, 0);

	if (!gewinn_angenommen && !teilgewinn_angenommen) {

		if (counter % 2 == 0) {
			zeige_feld(rfeld, 1);
			audio_play("risiko2");
		}
		else {
			zeige_feld(ns, 1);
			audio_play("risiko1");
		}
		// automatische Gewinnannahme
		counter = counter + 1;
		if (counter > (2 * auto_annahme)) Gewinn_annehmen();
		// Risikoautomatik
		if (counter > (2 * auto_risiko) && risikoautomatik && (gs < rsr || (10 < gs && gs < rsl))) {
			risiko_auto();
		}
		if (riskiert) {
			if (win) {
				gs = gs + 1;
				gewinn = gpu[gs];
				zeige_feld(ns, 0);
				zeige_feld(gs, 1);
			}
			else {
				gs = 0;
				zeige_feld(rfeld, 0);
				zeige_feld(ns, 1);
				button_color("stop_button", btn_rot_aus);
			}
			setInfo(" ");
			starte_risiko();
		}
		else setTimeout("animiere_risiko();", 500);
	}
	else {
		zeige_feld(ns, 0);
		zeige_feld(rfeld, 0);
		zeige_feld(gs, 1);
		if (teilgewinn_angenommen)
			teilgewinn_angenommen = false;

	}
}

function animiere_ausspielung(von_, bis_, feld_) {
	// Ausspielung , von Feld,
	//  bis Feld,  startet bei Feld z.b. (5, 9, 5)

	button_text("stop_button", btnText[2]);
	button_color("stop_button", btn_rot_an);

	von = von_;
	bis = bis_;

	if (feld_ == bis + 1) feld_ = von;

	if (ga) { // grosse A. andere Reihenfolge
		feld = arf[feld_];
		if (feld_ == von) feld_davor = arf[bis];
		else feld_davor = arf[feld_ - 1];
	}
	else { // kleine Ausspielung
		feld = feld_;
		if (feld == von) feld_davor = bis;
		else feld_davor = feld - 1;
	}

	next = feld_ + 1;
	zeige_feld(feld, 1);
	zeige_feld(feld_davor, 0);

	if ((gs == feld || gam == feld) && !ausspielung) {

		ga = false;
		gewinn = gpu[gs];
		zeige_Gewinn();
		resetA();
		audio_stop();
		setTimeout("zeige_feld(feld, 0);", 20 * spiel_tempo);
		setTimeout("starte_risiko();", 20 * spiel_tempo);
	}

	else {
		setTimeout("animiere_ausspielung(von, bis, next);", 2 * spiel_tempo);
	}
}

function ausspiel_gs(gewinnstufe, prozentsatz) {
	
	// Dieser Funktion werden als Argumente alle Gewinnstufen und 
	// die dazugehörigen Prozentangaben übergeben. Die Funktion
	// zieht dann eine Zufallszahl und ermittelt welche Gewinnstufe
	// die Ausspielung gewonnen hat, diese wird dann als    
    // Rückgabewert zurùckgegeben
   
	var gw = [];
    var pw = [];
	var a = 0;
    var b = 0;
	var z = zufallszahl(1, 100);
	
	gewinn_angenommen = false;
	ausspielung = true;
	audio_play("ausspielung");
	
	 for (i = 0; i < arguments.length; i++) {
     	(i % 2 == 0) ? gw.push(arguments[i]) : pw.push(arguments[i]);
     }
	
	for (var i = 0; i < pw.length; i++) {
		b = a + pw[i];
		if ( (a < z) && (z <= b) ) break;
		a = b;
	}
	
	return gw[i]; // gs

}

function kleine_Ausspielung_links() {

	gs = ausspiel_gs(11,50, 12,15, 13,10, 14,10, 15,10, 16,5);
	animiere_ausspielung(11, 16, 11);
	setTimeout("ausspiel_stop();", 20 * spiel_tempo);
}

function kleine_Ausspielung_rechts() {

	gs = ausspiel_gs(1,50, 2,20, 3,15, 4,10, 5,5);
	animiere_ausspielung(1, 5, 1);
	setTimeout("ausspiel_stop();", 20 * spiel_tempo);
}

function grosse_Ausspielung_links() {

	//   Grosse Ausspielung animieren,
	//    von 3 bis 100 Sonderspiele
	//    extra spannend

	ga = true;
	setInfo(infoText[21]);
	blinkGal();

	gs = ausspiel_gs(15,50, 16,15, 17,10, 18,10, 19,10, 20,5);
	animiere_ausspielung(15, 20, 15);
	setTimeout("ausspiel_stop();", 40 * spiel_tempo);
}

function grosse_Ausspielung_rechts() {

	ga = true;
	blinkGar();
	setInfo(infoText[20]);

	gs = ausspiel_gs(4,50, 5,15, 6,10, 7,10, 8,10, 9,5);
	animiere_ausspielung(4, 9, 4);
	setTimeout("ausspiel_stop();", 40 * spiel_tempo);
}

function grosse_Ausspielung_mitte() {

	// Zuordnung von Gewinnstufe auf Ausspielfelder(21-28)
	// damit das richtige Gewinnfeld beleuchtet wird, nicht
	// nur das in der Risikoleiter
	var gam_gs = [0, 0, 0, 0, 0, 0, 21, 23, 25, 27, 0, 0, 0, 0, 0, 0, 0, 22, 24, 26, 28];

	ga = true;
	setInfo(infoText[22]);

	gs = ausspiel_gs(6,25, 17,25, 7,15, 18,15, 8,5, 19,5, 9,5, 20,5);
	gam = gam_gs[gs];
	animiere_ausspielung(21, 28, 21);
	setTimeout("ausspiel_stop();", 50 * spiel_tempo);
}

function einfacher_Gewinn(eg) {

	switch (eg) {
		case 160:
			gs = 14;
			break;
		case 120:
			gs = 3;
			break;
		case 80:
			gs = 13;
			break;
		case 60:
			gs = 2;
			break;
		case 40:
			gs = 12;
			break;
		case 30:
			gs = 1;
			break;
		case 20:
			gs = 11;
			break;
	}
	gewinn = gpu[gs];
	zeige_Gewinn();
	zeige_feld(gs, 1);
	setTimeout("starte_risiko();", 20 * spiel_tempo);
}

function Gewinnermittlung() {

	var i;
	var j;
	var k = 0;
	var sonne = 0;
	var tmp = 0;
	var ge = new Array();

	gs = 0;
	gewinn = 0;

	audio_stop();

	for (i = 0; i <= 1; i++) {
		for (j = 3; j <= 4; j++) {
			if (disc[i][s1] == disc[j][s3]) {
				ge[k] = disc[i][s1];
				if (ge[k] == 999) sonne++;
				k++;
			}
		}
	}

	if (ge.length > 1 && ge[1] > ge[0]) {
		tmp = ge[0];
		ge[0] = ge[1];
		ge[1] = tmp;
	}

	if (disc[2][s2] == 999) {

		switch (sonne) {
			case 4: //gam
				gs = 6;
				ausspielung = true;
				setTimeout("grosse_Ausspielung_mitte();", 30 * spiel_tempo);
				break;
			case 2: // gal
				gs = 15;
				ausspielung = true;
				setTimeout("grosse_Ausspielung_links();", 30 * spiel_tempo);
				break;
			case 1: // gar
				gs = 4;
				ausspielung = true;
				setTimeout("grosse_Ausspielung_rechts();", 30 * spiel_tempo);
				break;
			case 0:
				if (ge.length > 0 && ge[0] > 30) {
					gs = 11;
					einfacher_Gewinn(ge[0]);
				}
				else if (ge[0] == 30) {
					gs = 1;
					zeige_feld(gs, 1);
					setTimeout("kleine_Ausspielung_rechts();", 15 * spiel_tempo);
				}
				else {
					gs = 11;
					zeige_feld(gs, 1);
					setTimeout("kleine_Ausspielung_links();", 15 * spiel_tempo);
				}
				break;
		}

	}

	if (ge.length > 0 && disc[2][s2] != 999) {
		for (i = 0; i < ge.length; i++) {
			if (ge[i] == disc[2][s2]) {
				gs = 11;
				einfacher_Gewinn(ge[i]);
			}
		}
	}
	if (gs == 0) {
		setTimeout("the_end();", 20 * spiel_tempo);
	}

}

// ENDE