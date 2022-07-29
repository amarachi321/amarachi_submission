'reach 0.1';

export const main = Reach.App(() => {
    const Creator = Participant('Creator', {
        informTimeout: Fun([UInt], Null),
        payamt: Fun([], UInt),
        endprogramvalue: UInt,
        Switch_value: Fun([], UInt)
    })
    const User = Participant('User', {
        informTimeout: Fun([UInt], Null),
        acceptpayamt: Fun([UInt], UInt),
    })

    init()
    Creator.only(() => {
        const payyamt = declassify(interact.payamt())
        const endvalue = declassify(interact.endprogramvalue)
    })
    Creator.publish(payyamt, endvalue)
        .pay(payyamt)
    commit()

    User.only(() => {
        const acceptpayyamt = declassify(interact.acceptpayamt(payyamt))
    })
    User.publish(acceptpayyamt)
    commit()

    each([Creator, User], () => {
        interact.informTimeout(endvalue)
    })
    Creator.publish()
    const endval =
        acceptpayyamt == 1 ? lastConsensusTime() + endvalue :
            lastConsensusTime() + 0
    var Creatorstatus = 0
    invariant(balance() == payyamt)
    while (lastConsensusTime() <= endval) {
        commit()
        Creator.only(() => {
            const Creatorval = declassify(interact.Switch_value())
        })
        Creator.publish(Creatorval)
        Creatorstatus = Creatorval
        continue
    }
    const [forCreator, forUser] =
        Creatorstatus == 1 ? [1, 0] :
            [0, 1]
    transfer(forCreator * payyamt).to(Creator)
    transfer(forUser * payyamt).to(User)

    commit()

});
