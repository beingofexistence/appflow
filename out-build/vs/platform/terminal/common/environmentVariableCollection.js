/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/platform/terminal/common/environmentVariable"], function (require, exports, platform_1, environmentVariable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$gr = void 0;
    const mutatorTypeToLabelMap = new Map([
        [environmentVariable_1.EnvironmentVariableMutatorType.Append, 'APPEND'],
        [environmentVariable_1.EnvironmentVariableMutatorType.Prepend, 'PREPEND'],
        [environmentVariable_1.EnvironmentVariableMutatorType.Replace, 'REPLACE']
    ]);
    class $gr {
        constructor(collections) {
            this.collections = collections;
            this.a = new Map();
            this.b = new Map();
            collections.forEach((collection, extensionIdentifier) => {
                this.d(collection, extensionIdentifier);
                const it = collection.map.entries();
                let next = it.next();
                while (!next.done) {
                    const mutator = next.value[1];
                    const key = next.value[0];
                    let entry = this.a.get(key);
                    if (!entry) {
                        entry = [];
                        this.a.set(key, entry);
                    }
                    // If the first item in the entry is replace ignore any other entries as they would
                    // just get replaced by this one.
                    if (entry.length > 0 && entry[0].type === environmentVariable_1.EnvironmentVariableMutatorType.Replace) {
                        next = it.next();
                        continue;
                    }
                    const extensionMutator = {
                        extensionIdentifier,
                        value: mutator.value,
                        type: mutator.type,
                        scope: mutator.scope,
                        variable: mutator.variable,
                        options: mutator.options
                    };
                    if (!extensionMutator.scope) {
                        delete extensionMutator.scope; // Convenient for tests
                    }
                    // Mutators get applied in the reverse order than they are created
                    entry.unshift(extensionMutator);
                    next = it.next();
                }
            });
        }
        async applyToProcessEnvironment(env, scope, variableResolver) {
            let lowerToActualVariableNames;
            if (platform_1.$i) {
                lowerToActualVariableNames = {};
                Object.keys(env).forEach(e => lowerToActualVariableNames[e.toLowerCase()] = e);
            }
            for (const [variable, mutators] of this.getVariableMap(scope)) {
                const actualVariable = platform_1.$i ? lowerToActualVariableNames[variable.toLowerCase()] || variable : variable;
                for (const mutator of mutators) {
                    const value = variableResolver ? await variableResolver(mutator.value) : mutator.value;
                    // Default: true
                    if (mutator.options?.applyAtProcessCreation ?? true) {
                        switch (mutator.type) {
                            case environmentVariable_1.EnvironmentVariableMutatorType.Append:
                                env[actualVariable] = (env[actualVariable] || '') + value;
                                break;
                            case environmentVariable_1.EnvironmentVariableMutatorType.Prepend:
                                env[actualVariable] = value + (env[actualVariable] || '');
                                break;
                            case environmentVariable_1.EnvironmentVariableMutatorType.Replace:
                                env[actualVariable] = value;
                                break;
                        }
                    }
                    // Default: false
                    if (mutator.options?.applyAtShellIntegration ?? false) {
                        const key = `VSCODE_ENV_${mutatorTypeToLabelMap.get(mutator.type)}`;
                        env[key] = (env[key] ? env[key] + ':' : '') + variable + '=' + this.c(value);
                    }
                }
            }
        }
        c(value) {
            return value.replaceAll(':', '\\x3a');
        }
        diff(other, scope) {
            const added = new Map();
            const changed = new Map();
            const removed = new Map();
            // Find added
            other.getVariableMap(scope).forEach((otherMutators, variable) => {
                const currentMutators = this.getVariableMap(scope).get(variable);
                const result = getMissingMutatorsFromArray(otherMutators, currentMutators);
                if (result) {
                    added.set(variable, result);
                }
            });
            // Find removed
            this.getVariableMap(scope).forEach((currentMutators, variable) => {
                const otherMutators = other.getVariableMap(scope).get(variable);
                const result = getMissingMutatorsFromArray(currentMutators, otherMutators);
                if (result) {
                    removed.set(variable, result);
                }
            });
            // Find changed
            this.getVariableMap(scope).forEach((currentMutators, variable) => {
                const otherMutators = other.getVariableMap(scope).get(variable);
                const result = getChangedMutatorsFromArray(currentMutators, otherMutators);
                if (result) {
                    changed.set(variable, result);
                }
            });
            if (added.size === 0 && changed.size === 0 && removed.size === 0) {
                return undefined;
            }
            return { added, changed, removed };
        }
        getVariableMap(scope) {
            const result = new Map();
            for (const mutators of this.a.values()) {
                const filteredMutators = mutators.filter(m => filterScope(m, scope));
                if (filteredMutators.length > 0) {
                    // All of these mutators are for the same variable because they are in the same scope, hence choose anyone to form a key.
                    result.set(filteredMutators[0].variable, filteredMutators);
                }
            }
            return result;
        }
        getDescriptionMap(scope) {
            const result = new Map();
            for (const mutators of this.b.values()) {
                const filteredMutators = mutators.filter(m => filterScope(m, scope, true));
                for (const mutator of filteredMutators) {
                    result.set(mutator.extensionIdentifier, mutator.description);
                }
            }
            return result;
        }
        d(collection, extensionIdentifier) {
            if (!collection.descriptionMap) {
                return;
            }
            const it = collection.descriptionMap.entries();
            let next = it.next();
            while (!next.done) {
                const mutator = next.value[1];
                const key = next.value[0];
                let entry = this.b.get(key);
                if (!entry) {
                    entry = [];
                    this.b.set(key, entry);
                }
                const extensionMutator = {
                    extensionIdentifier,
                    scope: mutator.scope,
                    description: mutator.description
                };
                if (!extensionMutator.scope) {
                    delete extensionMutator.scope; // Convenient for tests
                }
                entry.push(extensionMutator);
                next = it.next();
            }
        }
    }
    exports.$gr = $gr;
    /**
     * Returns whether a mutator matches with the scope provided.
     * @param mutator Mutator to filter
     * @param scope Scope to be used for querying
     * @param strictFilter If true, mutators with global scope is not returned when querying for workspace scope.
     * i.e whether mutator scope should always exactly match with query scope.
     */
    function filterScope(mutator, scope, strictFilter = false) {
        if (!mutator.scope) {
            if (strictFilter) {
                return scope === mutator.scope;
            }
            return true;
        }
        // If a mutator is scoped to a workspace folder, only apply it if the workspace
        // folder matches.
        if (mutator.scope.workspaceFolder && scope?.workspaceFolder && mutator.scope.workspaceFolder.index === scope.workspaceFolder.index) {
            return true;
        }
        return false;
    }
    function getMissingMutatorsFromArray(current, other) {
        // If it doesn't exist, all are removed
        if (!other) {
            return current;
        }
        // Create a map to help
        const otherMutatorExtensions = new Set();
        other.forEach(m => otherMutatorExtensions.add(m.extensionIdentifier));
        // Find entries removed from other
        const result = [];
        current.forEach(mutator => {
            if (!otherMutatorExtensions.has(mutator.extensionIdentifier)) {
                result.push(mutator);
            }
        });
        return result.length === 0 ? undefined : result;
    }
    function getChangedMutatorsFromArray(current, other) {
        // If it doesn't exist, none are changed (they are removed)
        if (!other) {
            return undefined;
        }
        // Create a map to help
        const otherMutatorExtensions = new Map();
        other.forEach(m => otherMutatorExtensions.set(m.extensionIdentifier, m));
        // Find entries that exist in both but are not equal
        const result = [];
        current.forEach(mutator => {
            const otherMutator = otherMutatorExtensions.get(mutator.extensionIdentifier);
            if (otherMutator && (mutator.type !== otherMutator.type || mutator.value !== otherMutator.value || mutator.scope?.workspaceFolder?.index !== otherMutator.scope?.workspaceFolder?.index)) {
                // Return the new result, not the old one
                result.push(otherMutator);
            }
        });
        return result.length === 0 ? undefined : result;
    }
});
//# sourceMappingURL=environmentVariableCollection.js.map