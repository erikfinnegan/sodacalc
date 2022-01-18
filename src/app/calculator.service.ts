import { typeWithParameters } from "@angular/compiler/src/render3/util";

export class CalculatorService {
    getFourThree(units: object, dpMods, opMods, miscMods, minDpLeftHome) {
        var unitArray = [];
        for (const [key, unit] of Object.entries(units)) {
            unitArray.push(unit);
            unit.sent = 0;
        }
        
        unitArray.sort(function(x, y) { // sorts by most appealing attacker based on OP:DP ratio
            if (y.ratio == x.ratio) {
                return y.op - x.op;
            }
            return Math.abs(y.ratio) - Math.abs(x.ratio);
        });

        var fourThreeRawOffense = 0;
        var fourThreeRawDefense = eval(this.getDefenses(units, dpMods, opMods, miscMods).raw);
        const offenseMods = this.getTotalOffenseMultiplier(opMods, miscMods);
        const defenseMods = this.getTotalDefenseMultiplier(dpMods, miscMods);
        var morale = 0.9 + (this.parseInput(miscMods.morale) / 1000);

        unitArray.forEach(unit => {
            for (let i = 0; i < unit.quantity; i++) {
                if (eval(unit.op) > 0) {
                    fourThreeRawOffense = fourThreeRawOffense + eval(unit.op);
                    fourThreeRawDefense = fourThreeRawDefense - eval(unit.dp);
                    unit.sent = unit.sent + 1;

                    if ( ( (fourThreeRawOffense * offenseMods * morale) / (fourThreeRawDefense * defenseMods * morale) > (4/3) ) || ( (fourThreeRawDefense * defenseMods * morale) < minDpLeftHome) && eval(unit.dp) != 0 ) {
                        fourThreeRawOffense = fourThreeRawOffense - eval(unit.op);
                        fourThreeRawDefense = fourThreeRawDefense + eval(unit.dp);
                        unit.sent = unit.sent - 1;
                    }
                }
            }
        });
        
        var fourThreeOffense = this.chattyNumber(fourThreeRawOffense * this.getTotalOffenseMultiplier(opMods, miscMods));
        var fourThreeDefense = this.chattyNumber(fourThreeRawDefense * this.getTotalDefenseMultiplier(dpMods, miscMods));
        var discordMessage = 'Error somewhere';

        var temples = (this.parseInput(miscMods.theirTemples) / 100) * 1.8;
        var otherMinusMods = miscMods.theirMinusMods;
        const theirTotalMinusMods = temples + otherMinusMods;

        if (theirTotalMinusMods != 0) {
            discordMessage = `can send ${fourThreeOffense} OP (${Math.ceil(theirTotalMinusMods)}% -mods), leaving ${fourThreeDefense} DP`;
        }
        else {
            discordMessage = `can send ${fourThreeOffense} OP, leaving ${fourThreeDefense} DP`;
        }
        if (miscMods.ambush) {
            discordMessage += " (ambush included)"
        }
        if (miscMods.glaciers != 0) {
            discordMessage += " (glaciers included)"
        }
        
        console.log(`DISCORD: ${discordMessage}`)
        return discordMessage;
    }

    getDefenses(units: object, dpMods, opMods, miscMods) {
        var morale = 0.9 + (this.parseInput(miscMods.morale) / 1000);
        var rawDp = 0;
        for (const [key, unit] of Object.entries(units)) {
            rawDp += (unit.quantity * unit.dp);
        }

        return {
            raw: this.numberWithCommas(rawDp),
            modded: this.numberWithCommas(rawDp * this.getTotalDefenseMultiplier(dpMods, miscMods) * morale),
            reduced: this.numberWithCommas(rawDp * this.getReducedDefenseMultiplier(dpMods, miscMods) * morale)
        }
    }

    getTotalOffenseMultiplier(opMods, miscMods) {
        var prestige = this.parseInput(miscMods.prestige) / 10000;
        var imps = this.parseInput(opMods.imps) / 100;
        var buildings = (this.parseInput(opMods.bldgMult) * this.parseInput(opMods.bldgPercent)) / 100;
        var advances = this.parseInput(opMods.advances) / 100;
        var other = this.parseInput(opMods.other) / 100;

        var total = (1 + prestige + imps + buildings + advances + other);

        if (miscMods.ambush) {
            return (total / 0.9);
        }
        return total;
    }

    getTotalDefenseMultiplier(dpMods, miscMods) {
        var imps = this.parseInput(dpMods.imps) / 100;
        var buildings = (this.parseInput(dpMods.bldgMult) * this.parseInput(dpMods.bldgPercent)) / 100;
        var advances = this.parseInput(dpMods.advances) / 100;
        var other = this.parseInput(dpMods.other) / 100;
        var glaciers = this.parseInput(miscMods.glaciers);

        var total = (1 + imps + buildings + advances + other);
        return total / (1 - glaciers/100);
    }

    getReducedDefenseMultiplier(dpMods, miscMods) {
        var temples = ((this.parseInput(miscMods.myTemples) / 100) * 1.8) / 100;
        var otherMinusMods = miscMods.myMinusMods / 100;
        return Math.max((this.getTotalDefenseMultiplier(dpMods, miscMods) - temples - otherMinusMods), 1);
    }

    parseInput(input) {
        return eval(input.replace(",", "")) || 0;
    }

    numberWithCommas(x) {
        return Math.ceil(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    chattyNumber(fullNumber) {
        if (fullNumber > 1000000) {
            console.log(fullNumber);
            var chattyVersion = (fullNumber / 1000000).toFixed(2);
            return `${chattyVersion}m`;
        }
        if (fullNumber > 1000) {
            var chattyVersion = (fullNumber / 1000).toFixed(0);
            return `${chattyVersion}k`;
        }
        return this.numberWithCommas(fullNumber);
    }
}

// calcIt: return an object with raw, modded, and temple-reduced DP
// fourThree: return the Discord bit and the "I'm safe with" number