/*
  Oxygen Not Included Seed Browser Frontend
  Copyright (C) 2025 The Maps Not Included Authors
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.
  
  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
  
  See the AUTHORS file in the project root for a full list of contributors.
*/

import * as L from "leaflet";

// Let's have some fun and make absurdly small and large units
export const LeafletExpandedScaleControl = L.Control.Scale.extend({
    // SI or IAU units
    _updateMetric: function (maxMeters: number) {
        let meters = this._getRoundNum(maxMeters);
        let astronomicalUnit = this._getRoundNum(maxMeters / 149597870700);
        let label = '';
        let ratio = 1;

        if (astronomicalUnit <= 1) {
            if (maxMeters >= 1000) {
                label = (meters / 1000) + ' km';
                ratio = (meters / 1000) * 1000 / maxMeters;
            } else if (maxMeters >= 1) {
                label = meters + ' m';
                ratio = meters / maxMeters;
            } else if (maxMeters >= 0.01) {
                let cm = this._getRoundNum(maxMeters * 100);
                label = cm + ' cm';
                ratio = cm / 100 / maxMeters;
            } else if (maxMeters >= 0.001) {
                let mm = this._getRoundNum(maxMeters * 1000);
                label = mm + ' mm';
                ratio = mm / 1000 / maxMeters;
            } else if (maxMeters >= 1e-6) {
                let um = this._getRoundNum(maxMeters * 1e6);
                label = um + ' μm';
                ratio = um / 1e6 / maxMeters;
            } else if (maxMeters >= 1e-9) {
                let nm = this._getRoundNum(maxMeters * 1e9);
                label = nm + ' nm';
                ratio = nm / 1e9 / maxMeters;
            } else if (maxMeters >= 1e-12) {
                let pm = this._getRoundNum(maxMeters * 1e12);
                label = pm + ' pm';
                ratio = pm / 1e12 / maxMeters;
            } else if (maxMeters >= 1e-15) {
                let fm = this._getRoundNum(maxMeters * 1e15);
                label = fm + ' fm';
                ratio = fm / 1e15 / maxMeters;
            } else if (maxMeters >= 1e-18) {
                let am = this._getRoundNum(maxMeters * 1e18);
                label = am + ' am';
                ratio = am / 1e18 / maxMeters;
            } else if (maxMeters >= 1e-21) {
                let zm = this._getRoundNum(maxMeters * 1e21);
                label = zm + ' zm';
                ratio = zm / 1e21 / maxMeters;
            } else if (maxMeters >= 1e-24) {
                let ym = this._getRoundNum(maxMeters * 1e24);
                label = ym + ' ym';
                ratio = ym / 1e24 / maxMeters;
            } else if (maxMeters >= 1e-27) {
                let rm = this._getRoundNum(maxMeters * 1e27);
                label = rm + ' rm';
                ratio = rm / 1e27 / maxMeters;
            } else if (maxMeters >= 1e-30) {
                let qm = this._getRoundNum(maxMeters * 1e30);
                label = qm + ' qm';
                ratio = qm / 1e30 / maxMeters;
            }
        } else {
            let maxParsecs = maxMeters / 3.0857e16;
            if (astronomicalUnit <= 1e3) {
                let au = this._getRoundNum(astronomicalUnit);
                label = au + ' au';
                ratio = au / maxMeters;
            } else if (maxParsecs <= 1) {
                let kau = this._getRoundNum(maxParsecs * 1e3);
                label = kau + ' kau';
                ratio = kau / maxMeters;
            } else if (maxParsecs <= 1e3) {
                let parsec = this._getRoundNum(maxParsecs);
                label = parsec + ' pc';
                ratio = parsec / maxMeters;
            } else if (maxParsecs <= 1e6) {
                let kiloparsec = this._getRoundNum(maxParsecs / 1e3);
                label = kiloparsec + ' kpc';
                ratio = kiloparsec * 1e3 / maxMeters;
            } else if (maxParsecs <= 1e9) {
                let megaparsec = this._getRoundNum(maxParsecs / 1e6);
                label = megaparsec + ' Mpc';
                ratio = megaparsec * 1e6 / maxMeters;
            } else if (maxParsecs <= 1e12) {
                let gigaparsec = this._getRoundNum(maxParsecs / 1e9);
                label = gigaparsec + ' Gpc';
                ratio = gigaparsec * 1e9 / maxMeters;
            } else if (maxParsecs <= 1e15) {
                let teraparsec = this._getRoundNum(maxParsecs / 1e12);
                label = teraparsec + ' Tpc';
                ratio = teraparsec * 1e12 / maxMeters;
            } else {
                let teraparsec = this._getRoundNum(maxParsecs / 1e15);
                label = teraparsec + ' Ppc';
                ratio = teraparsec * 1e15 / maxMeters;
            }
        }

        this._updateScale(this._mScale, label, ratio);
    },

    _updateImperial: function (maxMeters: number) {
        const feet = maxMeters * 3.2808399;
        const inches = feet * 12;
        const thou = inches * 1000;
        const lightSecond = maxMeters / 299792458;
        const lightYear = lightSecond / (60 * 60 * 24 * 365.25); // Julian year
        let label = '';
        let ratio = 1;

        if (lightSecond < 1) {
            if (feet >= 5280) {
                let miles = this._getRoundNum(feet / 5280);
                label = miles + ' mi';
                ratio = miles * 5280 / feet;
            } else if (feet >= 1) {
                let f = this._getRoundNum(feet);
                label = f + ' ft';
                ratio = f / feet;
            } else if (inches >= 1) {
                let inch = this._getRoundNum(inches);
                label = inch + ' in';
                ratio = inch / inches;
            } else if (thou >= 1) {
                let m = this._getRoundNum(thou);
                label = m + ' thou'; // "mils" is ambiguous
                ratio = m / thou;
            } else if (maxMeters >= 1e-10) {
                let ang = this._getRoundNum(maxMeters * 1e10);
                label = ang + ' Å';
                ratio = ang / 1e10 / maxMeters;
            } else if (maxMeters >= 1.0021e-13) {
                let xu = this._getRoundNum(maxMeters / 1.0021e-13);
                label = xu + ' xu';
                ratio = xu * 1.0021e-13 / maxMeters;
            } else if (maxMeters >= 2.817940285e-15) {
                let electronRadii = this._getRoundNum(maxMeters / 2.817940285e-15);
                label = electronRadii + ' rₑ';
                ratio = electronRadii * 2.817940285e-15 / maxMeters;
            } else {
                let plankUnits = this._getRoundNum(maxMeters / 1.616199e-35);
                label = plankUnits + ' 𝓁ₚ';
                ratio = plankUnits * 1.616199e-35 / maxMeters;
            }
        } else {
            if (lightSecond <= 60) {
                let lightSeconds = this._getRoundNum(lightSecond);
                label = lightSeconds + ' ls';
                ratio = lightSeconds / maxMeters;
            } else if (lightSecond <= 60 * 60) {
                let lightMinutes = this._getRoundNum(lightSecond / 60);
                label = lightMinutes + ' lm';
                ratio = lightMinutes * 60 / maxMeters;
            } else if (lightSecond <= 60 * 60 * 24) {
                let lightHours = this._getRoundNum(lightSecond / (60 * 60));
                label = lightHours + ' lh';
                ratio = lightHours * 60 * 60 / maxMeters;
            } else if (lightYear <= 1) {
                let lightDays = this._getRoundNum(lightSecond / (60 * 60 * 24));
                label = lightDays + ' ld';
                ratio = lightDays * 60 * 60 * 24 / maxMeters;
            } else if (lightYear <= 1e3) {
                let lightYears = this._getRoundNum(lightYear);
                label = lightYears + ' ly';
                ratio = lightYears / maxMeters;
            } else if (lightYear <= 1e6) {
                let kilolightYears = this._getRoundNum(lightYear / 1e3);
                label = kilolightYears + ' kly';
                ratio = kilolightYears * 1e3 / maxMeters;
            } else if (lightYear <= 1e9) {
                let megalightYears = this._getRoundNum(lightYear / 1e6);
                label = megalightYears + ' Mly';
                ratio = megalightYears * 1e6 / maxMeters;
            } else if (lightYear <= 1e12) {
                let gigalightYears = this._getRoundNum(lightYear / 1e9);
                label = gigalightYears + ' Gly';
                ratio = gigalightYears * 1e9 / maxMeters;
            } else if (lightYear <= 1e15) {
                let teralightYears = this._getRoundNum(lightYear / 1e12);
                label = teralightYears + ' Tly';
                ratio = teralightYears * 1e12 / maxMeters;
            } else {
                let teralightYears = this._getRoundNum(lightYear / 1e15);
                label = teralightYears + ' Ply';
                ratio = teralightYears * 1e15 / maxMeters;
            }
        }

        this._updateScale(this._iScale, label, ratio);
    }
})