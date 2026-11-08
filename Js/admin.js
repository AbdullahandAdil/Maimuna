
import { supabase } from './supabase.js';

// ===================================
// BASIC ELEMENTS
// ===================================

const ordersList = document.getElementById('ordersList');
const statusMessage = document.getElementById('statusMessage');

const statuses = [
  'pending',
  'processing',
  'completed',
  'delivered',
  'cancelled'
];

// ===================================
// ADMIN AUTHENTICATION
// ===================================

async function checkAdmin() {
  const { data: sessionData } =
    await supabase.auth.getSession();

  if (!sessionData.session) {
    window.location.href = 'admin-login.html';
    return false;
  }

  const { data, error } =
    await supabase.rpc('is_admin');

  if (error || data !== true) {
    await supabase.auth.signOut();
    window.location.href = 'admin-login.html';
    return false;
  }

  return true;
}

// ===================================
// CUSTOMER ORDERS
// ===================================

async function loadOrders() {
  statusMessage.textContent = 'Loading orders...';

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    statusMessage.textContent =
      'Error: ' + error.message;
    return;
  }

  document.getElementById('totalOrders').textContent =
    orders.length;

  document.getElementById('pendingOrders').textContent =
    orders.filter(o => o.status === 'pending').length;

  document.getElementById('processingOrders').textContent =
    orders.filter(o => o.status === 'processing').length;

  document.getElementById('completedOrders').textContent =
    orders.filter(o => o.status === 'completed').length;

  ordersList.replaceChildren();

  if (orders.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');

    cell.colSpan = 8;
    cell.textContent =
      'Abhi koi customer order nahi aaya hai.';

    row.appendChild(cell);
    ordersList.appendChild(row);
  }

  for (const order of orders) {
    const row = document.createElement('tr');

    // CUSTOMER INFORMATION

    const values = [
      order.customer_name || '-',
      order.phone || '-',
      order.service_name || '-',
      order.quantity ?? '-',
      order.details || '-',
      order.created_at
        ? new Date(order.created_at).toLocaleString('en-IN')
        : '-'
    ];

    values.forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = String(value);
      row.appendChild(cell);
    });

    // CUSTOMER FILE

    const fileCell = document.createElement('td');

    if (order.file_url) {
      const { data: fileData, error: fileError } =
        await supabase.storage
          .from('order-files')
          .createSignedUrl(order.file_url, 600);

      if (!fileError && fileData?.signedUrl) {
        const viewLink = document.createElement('a');

        viewLink.href = fileData.signedUrl;
        viewLink.textContent = 'View / Download';
        viewLink.target = '_blank';
        viewLink.rel = 'noopener noreferrer';

        fileCell.appendChild(viewLink);
      } else {
        fileCell.textContent = 'File unavailable';
      }
    } else {
      fileCell.textContent = 'No file';
    }

    row.appendChild(fileCell);

    // ORDER STATUS

    const statusCell = document.createElement('td');
    const select = document.createElement('select');

    statuses.forEach(status => {
      const option = document.createElement('option');

      option.value = status;
      option.textContent =
        status.charAt(0).toUpperCase() +
        status.slice(1);

      select.appendChild(option);
    });

    select.value = statuses.includes(order.status)
      ? order.status
      : 'pending';

    select.addEventListener('change', async () => {
      const oldStatus = order.status;

      select.disabled = true;
      statusMessage.textContent =
        'Updating order status...';

      const { error } = await supabase
        .from('orders')
        .update({ status: select.value })
        .eq('id', order.id);

      if (error) {
        statusMessage.textContent =
          'Update failed: ' + error.message;

        select.value = oldStatus;
        select.disabled = false;
        return;
      }

      statusMessage.textContent =
        'Order status updated successfully!';

      await loadOrders();
    });

    statusCell.appendChild(select);
    row.appendChild(statusCell);

    ordersList.appendChild(row);
  }

  statusMessage.textContent =
    orders.length + ' orders loaded.';
}

// ===================================
// REFRESH AND LOGOUT
// ===================================

document.getElementById('refreshBtn')
  .addEventListener('click', loadOrders);

document.getElementById('logoutBtn')
  .addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'admin-login.html';
  });

// ===================================
// MANAGE SERVICES
// ===================================

const serviceForm =
  document.getElementById('serviceForm');

const serviceId =
  document.getElementById('serviceId');

const serviceName =
  document.getElementById('serviceName');

const serviceDescription =
  document.getElementById('serviceDescription');

const serviceActive =
  document.getElementById('serviceActive');

const saveServiceBtn =
  document.getElementById('saveServiceBtn');

const cancelServiceBtn =
  document.getElementById('cancelServiceBtn');

const serviceMessage =
  document.getElementById('serviceMessage');

const adminServicesList =
  document.getElementById('adminServicesList');

async function loadAdminServices() {
  adminServicesList.textContent =
    'Loading services...';

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    adminServicesList.textContent = error.message;
    return;
  }

  adminServicesList.replaceChildren();

  if (!data || data.length === 0) {
    adminServicesList.textContent =
      'No services found.';
    return;
  }

  data.forEach(service => {
    const card = document.createElement('div');
    card.className = 'admin-service-card';

    const title = document.createElement('h3');
    title.textContent = service.name;

    const description = document.createElement('p');
    description.textContent =
      service.description || '';

    const status = document.createElement('p');
    status.textContent =
      service.is_active ? 'Active' : 'Inactive';

    // EDIT

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-service-btn';

    editBtn.addEventListener('click', () => {
      serviceId.value = service.id;
      serviceName.value = service.name;
      serviceDescription.value =
        service.description || '';

      serviceActive.checked = service.is_active;

      saveServiceBtn.textContent = 'Update Service';
      serviceMessage.textContent =
        'Editing: ' + service.name;

      serviceForm.scrollIntoView({
        behavior: 'smooth'
      });
    });

    // ACTIVATE / DEACTIVATE

    const toggleBtn = document.createElement('button');

    toggleBtn.textContent =
      service.is_active ? 'Deactivate' : 'Activate';

    toggleBtn.className = 'toggle-service-btn';

    toggleBtn.addEventListener('click', async () => {
      const { error } = await supabase
        .from('services')
        .update({
          is_active: !service.is_active
        })
        .eq('id', service.id);

      if (error) {
        alert(error.message);
        return;
      }

      loadAdminServices();
    });

    // DELETE

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-service-btn';

    deleteBtn.addEventListener('click', async () => {
      if (!confirm('Delete this service?')) return;

      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', service.id);

      if (error) {
        alert(error.message);
        return;
      }

      serviceMessage.textContent =
        'Service deleted successfully.';

      loadAdminServices();
    });

    card.append(
      title,
      description,
      status,
      editBtn,
      toggleBtn,
      deleteBtn
    );

    adminServicesList.appendChild(card);
  });
}

// ADD / UPDATE SERVICE

serviceForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = serviceName.value.trim();
  const description =
    serviceDescription.value.trim();

  if (!name) {
    serviceMessage.textContent =
      'Service name is required.';
    return;
  }

  saveServiceBtn.disabled = true;
  serviceMessage.textContent = 'Saving service...';

  const serviceData = {
    name,
    description,
    is_active: serviceActive.checked
  };

  let result;

  if (serviceId.value) {
    result = await supabase
      .from('services')
      .update(serviceData)
      .eq('id', serviceId.value);
  } else {
    result = await supabase
      .from('services')
      .insert([serviceData]);
  }

  saveServiceBtn.disabled = false;

  if (result.error) {
    serviceMessage.textContent =
      result.error.message;
    return;
  }

  serviceMessage.textContent =
    'Service saved successfully!';

  serviceForm.reset();
  serviceId.value = '';
  saveServiceBtn.textContent = 'Add Service';

  loadAdminServices();
});

// CANCEL SERVICE EDIT

cancelServiceBtn.addEventListener('click', () => {
  serviceForm.reset();
  serviceId.value = '';
  saveServiceBtn.textContent = 'Add Service';
  serviceMessage.textContent = '';
});

// ===================================
// LATEST DESIGNS MANAGEMENT
// ===================================

const designForm =
  document.getElementById('designForm');

const designId =
  document.getElementById('designId');

const designTitle =
  document.getElementById('designTitle');

const designDescription =
  document.getElementById('designDescription');

const designCategory =
  document.getElementById('designCategory');

const designImage =
  document.getElementById('designImage');

const designPublished =
  document.getElementById('designPublished');

const saveDesignBtn =
  document.getElementById('saveDesignBtn');

const cancelDesignBtn =
  document.getElementById('cancelDesignBtn');

const designMessage =
  document.getElementById('designMessage');

const adminDesignsList =
  document.getElementById('adminDesignsList');

let oldDesignImage = '';

async function loadAdminDesigns() {
  adminDesignsList.textContent =
    'Loading designs...';

  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    adminDesignsList.textContent = error.message;
    return;
  }

  adminDesignsList.replaceChildren();

  if (!data || data.length === 0) {
    adminDesignsList.textContent =
      'No designs uploaded yet.';
    return;
  }

  data.forEach(design => {
    const card = document.createElement('div');
    card.className = 'admin-design-card';

    const img = document.createElement('img');
    img.src = design.image_url;
    img.alt = design.title;
    img.loading = 'lazy';

    const title = document.createElement('h3');
    title.textContent = design.title;

    const description = document.createElement('p');
    description.textContent =
      design.description || '';

    const category = document.createElement('p');
    category.textContent =
      'Category: ' + (design.category || 'General');

    const status = document.createElement('p');
    status.textContent =
      design.is_published ? 'Published' : 'Unpublished';

    // EDIT DESIGN

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-design-btn';

    editBtn.addEventListener('click', () => {
      designId.value = design.id;
      designTitle.value = design.title;

      designDescription.value =
        design.description || '';

      designCategory.value =
        design.category || '';

      designPublished.checked =
        design.is_published;

      oldDesignImage = design.image_url;
      designImage.value = '';

      saveDesignBtn.textContent = 'Update Design';

      designMessage.textContent =
        'Editing: ' + design.title;

      designForm.scrollIntoView({
        behavior: 'smooth'
      });
    });

    // PUBLISH / UNPUBLISH

    const publishBtn = document.createElement('button');

    publishBtn.textContent =
      design.is_published ? 'Unpublish' : 'Publish';

    publishBtn.className = 'publish-design-btn';

    publishBtn.addEventListener('click', async () => {
      const { error } = await supabase
        .from('designs')
        .update({
          is_published: !design.is_published
        })
        .eq('id', design.id);

      if (error) {
        alert(error.message);
        return;
      }

      loadAdminDesigns();
    });

    // DELETE DESIGN

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-design-btn';

    deleteBtn.addEventListener('click', async () => {
      if (!confirm('Delete this design?')) return;

      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', design.id);

      if (error) {
        alert(error.message);
        return;
      }

      designMessage.textContent =
        'Design deleted successfully.';

      loadAdminDesigns();
    });

    card.append(
      img,
      title,
      description,
      category,
      status,
      editBtn,
      publishBtn,
      deleteBtn
    );

    adminDesignsList.appendChild(card);
  });
}

// ADD / UPDATE DESIGN

designForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = designTitle.value.trim();

  if (!title) {
    designMessage.textContent =
      'Please enter design title.';
    return;
  }

  const file = designImage.files[0];

  if (file) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      designMessage.textContent =
        'Only JPG, PNG and WEBP allowed.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      designMessage.textContent =
        'Image maximum size is 5 MB.';
      return;
    }
  }

  saveDesignBtn.disabled = true;
  designMessage.textContent = 'Saving design...';

  try {
    let imageUrl = oldDesignImage;

    // UPLOAD NEW IMAGE

    if (file) {
      const extension =
        file.name.split('.').pop().toLowerCase();

      const filePath =
        'designs/' + Date.now() + '-' +
        Math.random().toString(36).slice(2) +
        '.' + extension;

      const { error: uploadError } =
        await supabase.storage
          .from('design-images')
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type
          });

      if (uploadError) throw uploadError;

      const { data: publicData } =
        supabase.storage
          .from('design-images')
          .getPublicUrl(filePath);

      imageUrl = publicData.publicUrl;
    }

    if (!imageUrl) {
      throw new Error(
        'Please select a design image.'
      );
    }

    const designData = {
      title: title,
      description: designDescription.value.trim(),
      category: designCategory.value.trim(),
      image_url: imageUrl,
      is_published: designPublished.checked
    };

    let result;

    if (designId.value) {
      result = await supabase
        .from('designs')
        .update(designData)
        .eq('id', designId.value);
    } else {
      result = await supabase
        .from('designs')
        .insert([designData]);
    }

    if (result.error) throw result.error;

    designMessage.textContent =
      'Design saved successfully!';

    designForm.reset();
    designId.value = '';
    oldDesignImage = '';

    saveDesignBtn.textContent = 'Upload Design';

    await loadAdminDesigns();

  } catch (error) {
    designMessage.textContent = error.message;
  }

  saveDesignBtn.disabled = false;
});

// CANCEL DESIGN EDIT

cancelDesignBtn.addEventListener('click', () => {
  designForm.reset();
  designId.value = '';
  oldDesignImage = '';

  saveDesignBtn.textContent = 'Upload Design';
  designMessage.textContent = '';
});

// ===================================
// CUSTOMER CONTACT MESSAGES
// ===================================

async function loadContactMessages() {
  const list =
    document.getElementById('contactMessagesList');

  if (!list) return;

  list.textContent = 'Loading messages...';

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    list.textContent =
      'Error: ' + error.message;
    return;
  }

  list.replaceChildren();

  if (!data || data.length === 0) {
    list.textContent =
      'No customer messages yet.';
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'admin-service-card';

    const title = document.createElement('h3');
    title.textContent = item.subject;

    const name = document.createElement('p');
    name.textContent = 'Name: ' + item.name;

    const phone = document.createElement('p');
    phone.textContent = 'Phone: ' + item.phone;

    const email = document.createElement('p');
    email.textContent =
      'Email: ' + (item.email || 'Not provided');

    const message = document.createElement('p');
    message.textContent =
      'Message: ' + item.message;

    const status = document.createElement('p');
    status.textContent = 'Status: ' + item.status;

    const date = document.createElement('p');
    date.textContent =
      'Date: ' +
      new Date(item.created_at).toLocaleString();

    const select = document.createElement('select');

    ['new', 'read', 'replied'].forEach(value => {
      const option = document.createElement('option');

      option.value = value;
      option.textContent = value.toUpperCase();

      select.appendChild(option);
    });

    select.value = item.status;

    select.addEventListener('change', async () => {
      const oldStatus = item.status;

      const { error } = await supabase
        .from('contacts')
        .update({ status: select.value })
        .eq('id', item.id);

      if (error) {
        alert(error.message);
        select.value = oldStatus;
        return;
      }

      item.status = select.value;
      status.textContent =
        'Status: ' + item.status;
    });

    card.append(
      title,
      name,
      phone,
      email,
      message,
      status,
      date,
      select
    );

    list.appendChild(card);
  });
}

// ===================================
// START ADMIN DASHBOARD
// ===================================

if (await checkAdmin()) {
  await loadOrders();
  await loadAdminServices();
  await loadAdminDesigns();
  await loadContactMessages();
}
