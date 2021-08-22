export interface CodeFailure {
    error: any
    phase?: string
}

export interface CodeResult<R> {
    failure?: CodeFailure;
    // can be a cancel function
    result?: R;
}

const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor

export const execJsCode = <R = any>(code: string, context: Record<string, any>): Promise<CodeResult<R>> => {
    let exec = null
    let args = Object.keys(context)
    try {
        // exec takes a single param 'exports', for which we provide an empty object.
        // This is because whenever you import modules in the user-provided code, the TS compiler wants to
        // define a magic property on the implicit `exports` variable to indicate the user code is also an ES module.
        // It errors out if that implicit `exports` variable is undefined.
        //
        // The returned anonymous function takes a single param `context` which we provide at execution time.
        // context is used to pass in the metaframe object
        exec = AsyncFunction('exports', `"use strict"; return (async function(${args.join(', ')}){${code}})`)({}) // eslint-disable-line
    } catch (e) {
        return Promise.resolve({ failure: { error: e, phase: 'compile' } })
    }

    if (exec) {
        var phase = 'exec'
        let values = Object.values(context);
        if (exec.apply) {
            return exec.apply(null, values)
            .then((r: any) => ({ result: r }))
            .catch((e: any) => ({ failure: { error: e, phase } }))
        } else {
            return exec.then((a :typeof AsyncFunction) => {
                return a.apply(null, values);
            })
            .then((r: any) => ({ result: r,  }))
            .catch((e: any) => ({ failure: { error: e, phase } }))
        }
    }

    return Promise.resolve({ failure: { error: 'compile failed', phase: 'compile' } })
}
