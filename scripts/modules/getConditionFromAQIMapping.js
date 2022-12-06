function getConditionFromAQIMapping(value, mapping) {
    for(const [condition, range] of Object.entries(mapping)) {
        if(value >= range[0] && value <= range[1]) {
            return condition;
        }
    }
}

export default getConditionFromAQIMapping;