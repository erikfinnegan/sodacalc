import { Component } from '@angular/core';
import { CalculatorService } from './calculator.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    title = 'Erik Soda Calc';
    rawDp = '';
    moddedDp = '';
    reducedDp = '';
    fourThree = '';

    onCalcIt() {
        for (const [key, unit] of Object.entries(this.units)) {
            unit.ratio = eval(unit.op) / eval(unit.dp);
            if (eval(unit.dp) <= 0) {
                unit.ratio = eval(unit.op) * 999;
            }
        }
        const calculator = new CalculatorService();
        const defenses = calculator.getDefenses(this.units, this.opMods, this.dpMods, this.miscMods);
        this.rawDp = defenses.raw;
        this.moddedDp = defenses.modded;
        this.reducedDp = defenses.reduced;
        this.fourThree = calculator.getFourThree(this.units,this.opMods, this.dpMods, this.miscMods, this.minDpLeftHome);
        // console.log(this.fourThree);
    }

    onChangeMinDp() {
        this.minDpLeftHome = this.minDpLeftHome.replace(',', '');
        if (this.minDpLeftHome.slice(-1).toLocaleLowerCase() == 'k') {
            this.minDpLeftHome = this.minDpLeftHome.slice(0, -1) + '000';
        }
        else if (this.minDpLeftHome.slice(-1).toLocaleLowerCase() == 'm') {
            this.minDpLeftHome = this.minDpLeftHome.slice(0, -1).replace('.', '') + '000000';
        }
    }

    minDpLeftHome: string;
    units = {
        unit1: {
            quantity: '',
            op: '',
            dp: '',
            ratio: 0,
        },
        unit2: {
            quantity: '',
            op: '',
            dp: '',
            ratio: 0,
        },
        unit3: {
            quantity: '',
            op: '',
            dp: '',
            ratio: 0,
        },
        unit4: {
            quantity: '',
            op: '',
            dp: '',
            ratio: 0,
        },
        unit5: {
            quantity: '',
            op: '',
            dp: '',
            ratio: 0,
        },
    };
    opMods = {
        imps: '',
        bldgMult: '',
        bldgPercent: '',
        advances: '',
        other: '',
    };
    dpMods = {
        imps: '',
        bldgMult: '',
        bldgPercent: '',
        advances: '',
        other: '',
    };
    miscMods = {
        prestige: '',
        morale: '100',
        ambush: false,
        glaciers: '',
        myTemples: '',
        myMinusMods: '',
        theirTemples: '',
        theirMinusMods: '',
    };
}
