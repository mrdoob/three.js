/// Initialize the id counter. Call once at startup.
pub fn init_id_allocator() {
    unsafe {
        NEXT_ID = 1;
    }
}

/// Allocate and return a new unique id.
pub fn alloc_id() -> u32 {
    unsafe {
        let id = NEXT_ID;
        NEXT_ID += 1;
        id
    }
}

static mut NEXT_ID: u32 = 1;
