import React from 'react';
import './SelectBox.css';

const SelectBox = ({ label, placeholder, options, value, onChange, disabled }) => {
    
    return (
        <div className='selectbox'>
            <label>
                { label }
                <select value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}>
                    {options.map((option, index) => (
                        <option key={index} value={option.toLowerCase()}>
                            {option}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}

export default SelectBox;
