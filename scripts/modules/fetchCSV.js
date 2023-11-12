async function fetchCSV(resource) {
    const res = await fetch(resource);
    return await res.text();
}

export default fetchCSV;