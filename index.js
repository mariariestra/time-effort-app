import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

const TimeEffortApp = () => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    jobTitle: '',
    department: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    totalHours: '',
    eriPercent: '',
    nasaIslaPercent: '',
    oceanosPercent: '',
    capexPercent: '',
    dolPercent: '',
    privateGrantsPercent: '',
    unrestricted: '',
    activitiesDescription: '',
    employeeSignature: '',
    employeeDate: '',
    supervisorName: '',
    supervisorSignature: '',
    supervisorDate: '',
  });

  const [errors, setErrors] = useState({});
  const [totalPercent, setTotalPercent] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Funding sources for EcoExploratorio
  const fundingSources = [
    { key: 'eriPercent', label: 'ERI - Instituto de Resiliencia', color: '#2563eb' },
    { key: 'nasaIslaPercent', label: 'NASA Isla Grant 2', color: '#dc2626' },
    { key: 'oceanosPercent', label: 'OCEANOS / NASA Federal Award', color: '#059669' },
    { key: 'capexPercent', label: 'CAPEX / Government Funds (OGP)', color: '#7c3aed' },
    { key: 'dolPercent', label: 'Department of Labor (Law 52)', color: '#ea580c' },
    { key: 'privateGrantsPercent', label: 'Private/Corporate Grants', color: '#0891b2' },
    { key: 'unrestricted', label: 'General Operations (Unrestricted)', color: '#64748b' },
  ];

  const departments = [
    'Education',
    'Exhibits',
    'Administration',
    'Operations',
    'Finance',
    'ERI - Resilience Institute',
    'Other'
  ];

  // Calculate total percentage
  useEffect(() => {
    const total = fundingSources.reduce((sum, source) => {
      const value = parseFloat(formData[source.key]) || 0;
      return sum + value;
    }, 0);
    setTotalPercent(total);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.employeeName.trim()) newErrors.employeeName = 'Required';
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Required';
    if (!formData.department) newErrors.department = 'Required';
    if (!formData.payPeriodStart) newErrors.payPeriodStart = 'Required';
    if (!formData.payPeriodEnd) newErrors.payPeriodEnd = 'Required';
    if (!formData.totalHours || formData.totalHours <= 0) newErrors.totalHours = 'Required and must be > 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (totalPercent !== 100) {
      newErrors.percentage = `Total must equal 100% (currently ${totalPercent.toFixed(1)}%)`;
    }

    const hasAtLeastOne = fundingSources.some(source => 
      parseFloat(formData[source.key]) > 0
    );
    
    if (!hasAtLeastOne) {
      newErrors.percentage = 'At least one funding source must be > 0%';
    }

    if (!formData.activitiesDescription.trim()) {
      newErrors.activitiesDescription = 'Required - describe 2-3 specific activities per funding source';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.employeeSignature.trim()) newErrors.employeeSignature = 'Required';
    if (!formData.employeeDate) newErrors.employeeDate = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    if (!formData.supervisorName.trim()) newErrors.supervisorName = 'Required';
    if (!formData.supervisorSignature.trim()) newErrors.supervisorSignature = 'Required';
    if (!formData.supervisorDate) newErrors.supervisorDate = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    let isValid = false;
    
    switch(currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TIME AND EFFORT REPORT', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('EcoExploratorio: Museo de Ciencias de Puerto Rico', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('In compliance with 2 CFR 200.430(i)', pageWidth / 2, yPos, { align: 'center' });

    // Employee Information
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE INFORMATION', margin, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${formData.employeeName}`, margin, yPos);
    yPos += 6;
    doc.text(`Employee ID: ${formData.employeeId || 'N/A'}`, margin, yPos);
    yPos += 6;
    doc.text(`Job Title: ${formData.jobTitle}`, margin, yPos);
    yPos += 6;
    doc.text(`Department: ${formData.department}`, margin, yPos);

    // Pay Period
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('PAY PERIOD', margin, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${formData.payPeriodStart} to ${formData.payPeriodEnd}`, margin, yPos);
    yPos += 6;
    doc.text(`Total Hours Worked: ${formData.totalHours} hours`, margin, yPos);

    // Time Distribution
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('TIME DISTRIBUTION', margin, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');

    fundingSources.forEach(source => {
      const percent = parseFloat(formData[source.key]) || 0;
      if (percent > 0) {
        const hours = ((percent / 100) * parseFloat(formData.totalHours)).toFixed(2);
        doc.text(`${source.label}: ${percent}% (${hours} hrs)`, margin + 5, yPos);
        yPos += 6;
      }
    });

    yPos += 2;
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${totalPercent.toFixed(1)}%`, margin + 5, yPos);

    // Activities
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION OF ACTIVITIES', margin, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    
    const splitText = doc.splitTextToSize(formData.activitiesDescription, pageWidth - (2 * margin));
    splitText.forEach(line => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    // New page for certifications
    doc.addPage();
    yPos = 20;

    // Employee Certification
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPLOYEE CERTIFICATION', margin, yPos);
    yPos += 10;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const certText = doc.splitTextToSize(
      'I certify that this report accurately reflects the actual time worked by me during the period ' +
      'indicated above and that the distribution of time is a true and correct representation of my activities. ' +
      'I understand that this information is used to support salary charges to grants and may be subject to ' +
      'audit or review. This certification is made in compliance with 2 CFR 200.430(i) and knowingly providing ' +
      'false information may result in disciplinary action and recovery of funds.',
      pageWidth - (2 * margin)
    );
    
    certText.forEach(line => {
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Signature:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.employeeSignature, margin + 50, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.employeeDate, margin + 50, yPos);

    // Supervisor Review
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SUPERVISOR REVIEW AND CERTIFICATION', margin, yPos);
    yPos += 10;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const supervisorText = doc.splitTextToSize(
      'I have reviewed this Time & Effort report and confirm that it is reasonable, consistent with the ' +
      'employee\'s assigned duties, and supported by my knowledge of the work performed. I certify that ' +
      'this distribution accurately reflects the employee\'s activities during the reporting period.',
      pageWidth - (2 * margin)
    );
    
    supervisorText.forEach(line => {
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Supervisor Name:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.supervisorName, margin + 50, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Supervisor Signature:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.supervisorSignature, margin + 50, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.supervisorDate, margin + 50, yPos);

    // Footer
    yPos += 20;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const timestamp = new Date().toISOString();
    doc.text(`Generated: ${timestamp}`, margin, yPos);
    doc.text('This document was electronically generated and is valid without physical signature.', margin, yPos + 4);

    // Save the PDF
    const fileName = `TimeEffort_${formData.employeeName.replace(/\s+/g, '_')}_${formData.payPeriodStart}_${formData.payPeriodEnd}.pdf`;
    doc.save(fileName);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleSubmit = () => {
    if (validateStep4()) {
      generatePDF();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          padding: '40px 30px',
          color: 'white'
        }}>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: '700',
            letterSpacing: '-0.5px'
          }}>
            Time & Effort Report
          </h1>
          <p style={{
            margin: 0,
            opacity: 0.9,
            fontSize: '15px'
          }}>
            EcoExploratorio: Museo de Ciencias de Puerto Rico
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          padding: '30px',
          borderBottom: '1px solid #e5e7eb',
          gap: '12px'
        }}>
          {['Employee Info', 'Time Distribution', 'Employee Cert', 'Supervisor'].map((step, idx) => (
            <div key={idx} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: currentStep > idx + 1 ? '#10b981' : currentStep === idx + 1 ? '#3b82f6' : '#e5e7eb',
                color: currentStep >= idx + 1 ? 'white' : '#9ca3af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}>
                {currentStep > idx + 1 ? '✓' : idx + 1}
              </div>
              <span style={{
                fontSize: '12px',
                color: currentStep === idx + 1 ? '#1f2937' : '#9ca3af',
                fontWeight: currentStep === idx + 1 ? '600' : '400',
                textAlign: 'center'
              }}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div style={{ padding: '40px 30px' }}>
          
          {/* Step 1: Employee Information */}
          {currentStep === 1 && (
            <div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                marginBottom: '24px',
                color: '#1f2937'
              }}>
                Employee Information
              </h2>

              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>
                    Employee Full Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="employeeName"
                    value={formData.employeeName}
                    onChange={handleInputChange}
                    style={inputStyle(errors.employeeName)}
                    placeholder="Enter full name"
                  />
                  {errors.employeeName && <ErrorMessage message={errors.employeeName} />}
                </div>

                <div>
                  <label style={labelStyle}>
                    Employee ID <span style={{ fontSize: '12px', color: '#6b7280' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    style={inputStyle()}
                    placeholder="Enter employee ID if applicable"
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Job Title / Position <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    style={inputStyle(errors.jobTitle)}
                    placeholder="e.g., Education Coordinator"
                  />
                  {errors.jobTitle && <ErrorMessage message={errors.jobTitle} />}
                </div>

                <div>
                  <label style={labelStyle}>
                    Department / Program Area <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    style={inputStyle(errors.department)}
                  >
                    <option value="">Select department...</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <ErrorMessage message={errors.department} />}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>
                      Pay Period Start <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="payPeriodStart"
                      value={formData.payPeriodStart}
                      onChange={handleInputChange}
                      style={inputStyle(errors.payPeriodStart)}
                    />
                    {errors.payPeriodStart && <ErrorMessage message={errors.payPeriodStart} />}
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Pay Period End <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="payPeriodEnd"
                      value={formData.payPeriodEnd}
                      onChange={handleInputChange}
                      style={inputStyle(errors.payPeriodEnd)}
                    />
                    {errors.payPeriodEnd && <ErrorMessage message={errors.payPeriodEnd} />}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>
                    Total Hours Worked During This Pay Period <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="totalHours"
                    value={formData.totalHours}
                    onChange={handleInputChange}
                    style={inputStyle(errors.totalHours)}
                    placeholder="Enter total hours worked"
                    min="0"
                    step="0.5"
                  />
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
                    Enter the actual total hours worked during this pay period (not budgeted hours)
                  </div>
                  {errors.totalHours && <ErrorMessage message={errors.totalHours} />}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Time Distribution */}
          {currentStep === 2 && (
            <div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                marginBottom: '12px',
                color: '#1f2937'
              }}>
                Time Distribution by Funding Source
              </h2>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                Enter the percentage of time spent on each funding source. The total must equal 100%.
                This should reflect <strong>actual time worked</strong>, not budgeted or planned time.
              </p>

              {/* Total Display */}
              <div style={{
                background: totalPercent === 100 ? '#dcfce7' : totalPercent > 100 ? '#fee2e2' : '#fef3c7',
                border: `2px solid ${totalPercent === 100 ? '#22c55e' : totalPercent > 100 ? '#dc2626' : '#f59e0b'}`,
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                    Current Total
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {totalPercent === 100 ? '✓ Ready to proceed' : 'Must equal 100% to continue'}
                  </div>
                </div>
                <div style={{
                  fontSize: '36px',
                  fontWeight: '700',
                  color: totalPercent === 100 ? '#22c55e' : totalPercent > 100 ? '#dc2626' : '#f59e0b'
                }}>
                  {totalPercent.toFixed(1)}%
                </div>
              </div>

              {/* Funding Sources */}
              <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                {fundingSources.map(source => {
                  const value = parseFloat(formData[source.key]) || 0;
                  const hours = value > 0 ? ((value / 100) * parseFloat(formData.totalHours || 0)).toFixed(2) : '0.00';
                  
                  return (
                    <div key={source.key} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      background: value > 0 ? '#f9fafb' : 'white'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{
                          width: '4px',
                          height: '20px',
                          background: source.color,
                          borderRadius: '2px',
                          marginRight: '12px'
                        }} />
                        <label style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#1f2937',
                          flex: 1
                        }}>
                          {source.label}
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: '0 0 120px' }}>
                          <input
                            type="number"
                            name={source.key}
                            value={formData[source.key]}
                            onChange={handleInputChange}
                            style={{
                              ...inputStyle(),
                              paddingRight: '35px'
                            }}
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <span style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '14px',
                            color: '#9ca3af',
                            fontWeight: '600'
                          }}>%</span>
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#6b7280',
                          padding: '8px 12px',
                          background: '#f3f4f6',
                          borderRadius: '6px'
                        }}>
                          = {hours} hours
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.percentage && <ErrorMessage message={errors.percentage} />}

              {/* Activities Description */}
              <div style={{ marginTop: '32px' }}>
                <label style={labelStyle}>
                  Description of Activities Performed <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  name="activitiesDescription"
                  value={formData.activitiesDescription}
                  onChange={handleInputChange}
                  style={{
                    ...inputStyle(errors.activitiesDescription),
                    minHeight: '150px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="List 2-3 specific activities per funding source. Example:&#10;&#10;ERI – Conducted 3 resilience workshops in Ponce; developed curriculum module 2 on climate adaptation&#10;&#10;NASA Isla – Coordinated STEM outreach events; prepared grant quarterly report&#10;&#10;Administration – Staff meetings, administrative tasks"
                />
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
                  Describe the main activities performed related to the funding sources listed above.
                  Be specific enough to support audit review.
                </div>
                {errors.activitiesDescription && <ErrorMessage message={errors.activitiesDescription} />}
              </div>
            </div>
          )}

          {/* Step 3: Employee Certification */}
          {currentStep === 3 && (
            <div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                marginBottom: '24px',
                color: '#1f2937'
              }}>
                Employee Certification
              </h2>

              <div style={{
                background: '#f0f9ff',
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <div style={{
                  fontSize: '14px',
                  lineHeight: '1.8',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  <strong>I certify that:</strong>
                  <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
                    <li style={{ marginBottom: '8px' }}>
                      This report accurately reflects the <strong>actual time worked</strong> by me during the period indicated above
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      The distribution of time is a <strong>true and correct representation</strong> of my activities
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      This information is used to support salary charges to grants and may be subject to <strong>audit or review</strong>
                    </li>
                    <li>
                      I understand that knowingly providing false information may result in <strong>disciplinary action and recovery of funds</strong>
                    </li>
                  </ul>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontStyle: 'italic',
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #bfdbfe'
                }}>
                  In compliance with 2 CFR 200.430(i) - Compensation for Personal Services
                </div>
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>
                    Employee Electronic Signature (Full Name) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="employeeSignature"
                    value={formData.employeeSignature}
                    onChange={handleInputChange}
                    style={inputStyle(errors.employeeSignature)}
                    placeholder="Type your full name to sign electronically"
                  />
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
                    By typing your name, you are electronically signing this certification
                  </div>
                  {errors.employeeSignature && <ErrorMessage message={errors.employeeSignature} />}
                </div>

                <div>
                  <label style={labelStyle}>
                    Date <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="employeeDate"
                    value={formData.employeeDate}
                    onChange={handleInputChange}
                    style={inputStyle(errors.employeeDate)}
                  />
                  {errors.employeeDate && <ErrorMessage message={errors.employeeDate} />}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Supervisor Review */}
          {currentStep === 4 && (
            <div>
              <h2 style={{
                fontSize: '22px',
                fontWeight: '700',
                marginBottom: '24px',
                color: '#1f2937'
              }}>
                Supervisor Review and Certification
              </h2>

              <div style={{
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '32px'
              }}>
                <div style={{
                  fontSize: '14px',
                  lineHeight: '1.8',
                  color: '#1f2937',
                  marginBottom: '16px'
                }}>
                  <strong>Supervisor Certification:</strong>
                  <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
                    <li style={{ marginBottom: '8px' }}>
                      I have reviewed this Time & Effort report
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      It is <strong>reasonable and consistent</strong> with the employee's assigned duties
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      It is supported by my <strong>knowledge of the work performed</strong>
                    </li>
                    <li>
                      The distribution <strong>accurately reflects</strong> the employee's activities during the reporting period
                    </li>
                  </ul>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>
                    Supervisor Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="supervisorName"
                    value={formData.supervisorName}
                    onChange={handleInputChange}
                    style={inputStyle(errors.supervisorName)}
                    placeholder="Enter supervisor's full name"
                  />
                  {errors.supervisorName && <ErrorMessage message={errors.supervisorName} />}
                </div>

                <div>
                  <label style={labelStyle}>
                    Supervisor Electronic Signature (Full Name) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="supervisorSignature"
                    value={formData.supervisorSignature}
                    onChange={handleInputChange}
                    style={inputStyle(errors.supervisorSignature)}
                    placeholder="Type supervisor's full name to sign electronically"
                  />
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>
                    By typing the supervisor's name, you are electronically signing this certification
                  </div>
                  {errors.supervisorSignature && <ErrorMessage message={errors.supervisorSignature} />}
                </div>

                <div>
                  <label style={labelStyle}>
                    Date <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="supervisorDate"
                    value={formData.supervisorDate}
                    onChange={handleInputChange}
                    style={inputStyle(errors.supervisorDate)}
                  />
                  {errors.supervisorDate && <ErrorMessage message={errors.supervisorDate} />}
                </div>
              </div>

              {/* Summary Review */}
              <div style={{
                marginTop: '32px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                background: '#f9fafb'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#1f2937' }}>
                  Report Summary
                </h3>
                <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                  <div><strong>Employee:</strong> {formData.employeeName}</div>
                  <div><strong>Period:</strong> {formData.payPeriodStart} to {formData.payPeriodEnd}</div>
                  <div><strong>Total Hours:</strong> {formData.totalHours}</div>
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                    <strong>Time Distribution:</strong>
                    <div style={{ marginTop: '8px', paddingLeft: '16px' }}>
                      {fundingSources.map(source => {
                        const value = parseFloat(formData[source.key]) || 0;
                        if (value > 0) {
                          return (
                            <div key={source.key} style={{ marginBottom: '4px' }}>
                              {source.label}: {value}%
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div style={{
          padding: '24px 30px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          background: '#f9fafb'
        }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            style={{
              ...buttonStyle,
              background: currentStep === 1 ? '#e5e7eb' : 'white',
              color: currentStep === 1 ? '#9ca3af' : '#1f2937',
              border: '2px solid #e5e7eb',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ← Previous
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              style={{
                ...buttonStyle,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none'
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              style={{
                ...buttonStyle,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none'
              }}
            >
              Generate PDF & Submit
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: '#10b981',
          color: 'white',
          padding: '20px 30px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          fontSize: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideIn 0.3s ease',
          zIndex: 1000
        }}>
          <span style={{ fontSize: '24px' }}>✓</span>
          PDF Generated Successfully!
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '8px'
};

const inputStyle = (hasError = false) => ({
  width: '100%',
  padding: '12px 14px',
  fontSize: '15px',
  border: `2px solid ${hasError ? '#dc2626' : '#e5e7eb'}`,
  borderRadius: '8px',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  background: hasError ? '#fef2f2' : 'white'
});

const buttonStyle = {
  padding: '14px 28px',
  fontSize: '15px',
  fontWeight: '600',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const ErrorMessage = ({ message }) => (
  <div style={{
    color: '#dc2626',
    fontSize: '13px',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }}>
    <span>⚠</span> {message}
  </div>
);

export default TimeEffortApp;
ReactDOM.render(<TimeEffortApp />, document.getElementById('root'));
