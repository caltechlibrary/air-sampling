export async function fetchJSON(resource) {
    const res = await fetch(resource);
    if(!res.ok) throw new Error("Network response was not OK");
    return await res.json();
}

export async function fetchCSV(resource) {
    const res = await fetch(resource);
    return await res.text();
}