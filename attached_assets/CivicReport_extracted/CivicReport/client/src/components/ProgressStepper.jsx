import { HiCheck, HiOutlineClock } from 'react-icons/hi';

/**
 * ProgressStepper — visual step-based progress tracker for ticket lifecycle.
 *
 * @param {string} currentStatus — current ticket status
 */

const STEPS = ['Submitted', 'In Progress', 'Resolved'];

const ProgressStepper = ({ currentStatus }) => {
    // Map status to step index
    const statusIndex = STEPS.indexOf(currentStatus);
    // If rejected, show a special state
    const isRejected = currentStatus === 'Rejected';

    return (
        <div className="w-full">
            {isRejected ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">
                        ✕
                    </div>
                    <div>
                        <p className="font-semibold text-red-700">Ticket Rejected</p>
                        <p className="text-sm text-red-500">This ticket has been rejected by an admin.</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center">
                    {STEPS.map((step, index) => {
                        const isCompleted = index <= statusIndex;
                        const isCurrent = index === statusIndex;

                        return (
                            <div key={step} className="flex items-center flex-1 last:flex-initial">
                                {/* Step circle */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${isCompleted
                                                ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md'
                                                : 'bg-surface-200 text-surface-500'
                                            } ${isCurrent ? 'ring-4 ring-primary-200 scale-110' : ''}`}
                                    >
                                        {isCompleted && index < statusIndex ? (
                                            <HiCheck className="w-5 h-5" />
                                        ) : (
                                            <HiOutlineClock className="w-5 h-5" />
                                        )}
                                    </div>
                                    <span
                                        className={`mt-2 text-xs font-medium ${isCompleted ? 'text-primary-700' : 'text-surface-400'
                                            }`}
                                    >
                                        {step}
                                    </span>
                                </div>

                                {/* Connector line */}
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${index < statusIndex ? 'bg-primary-500' : 'bg-surface-200'
                                            }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProgressStepper;
