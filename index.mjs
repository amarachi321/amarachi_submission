import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask } from '@reach-sh/stdlib/ask.mjs';

const stdlib = loadStdlib();

const Creatorname = await ask("What is your name creator: ")
const Username = await ask("What is your name user : ")

const accCreator = await stdlib.newTestAccount(stdlib.parseCurrency(5500));
const accUser = await stdlib.newTestAccount(stdlib.parseCurrency(200));


const ctcCreator = accCreator.contract(backend);

const ctcUser = accUser.contract(backend, ctcCreator.getInfo())
console.log(`Welcome ${Creatorname} and ${Username}`)



const getbal = async (acc, name) => {
    const bal = await stdlib.balanceOf(acc);
    console.log(`${name} has ${stdlib.formatCurrency(bal)} ${stdlib.standardUnit} tokens`)
}

const creatorbal = await getbal(accCreator, Creatorname)
const userbal = await getbal(accUser, Username)
const endvalue = await ask(`${Creatorname} enter the deadline for the contract`)
await Promise.all([
    ctcCreator.p.Creator({
        informTimeout: async (val) => {
            console.log(`${Creatorname} the timeout is ${val} `)
        },
        payamt: async () => {
            const payamt = await ask(` ${Creatorname} enter amount you are willing to deposit: `)
            return stdlib.parseCurrency(parseInt(payamt))
        },
        endprogramvalue: parseInt(endvalue),
        Switch_value: async () => {
            const status = parseInt(await ask(`Are you there ${Creatorname}\nenter 1 for yes and 0 for no: `))
            const message = status == 1 ? `${Creatorname} is still here ` : `${Creatorname} isn't here `
            console.log(`${message}`)
            return status
        },

    }),
    ctcUser.p.User({
        acceptpayamt: async (payamt) => {
            const terms = await ask(`${Username} do you agree to the terms\n 1 for yes 0 for no`)
            console.log(`${Username} saw the deposit of ${stdlib.formatCurrency(payamt)} ${stdlib.standardUnit}`)
            if (parseInt(terms) == 1) {
                console.log(`${Username} accepted terms`)
                return parseInt(terms)
            } else if (parseInt(terms) == 0) {
                console.log(`${Username} didn't accept terms`)
                return parseInt(terms)
            }
        },
        informTimeout: async (val) => {
            console.log(`${Username} the timeout is ${val} `)
        },
    }),

]);

const creatorbal_after = await getbal(accCreator, Creatorname)
const userbal_after = await getbal(accUser, Username)
process.exit()
