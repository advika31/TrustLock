'use client';

import styles from './Stepper.module.scss';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className={styles.stepper} aria-label="Progress">
      {steps.map((label, index) => {
        const status =
          index === currentStep ? 'current' : index < currentStep ? 'complete' : 'pending';
        return (
          <li key={label} className={styles.step} data-status={status}>
            <span className={styles.badge} aria-hidden="true">
              {index + 1}
            </span>
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}


