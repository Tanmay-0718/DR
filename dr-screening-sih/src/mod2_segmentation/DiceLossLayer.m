classdef DiceLossLayer < nnet.layer.RegressionLayer
    % DICELOSSLAYER Custom Dice Loss layer for imbalanced segmentation heads.
    % Formulates soft Dice loss:
    %   Loss = 1 - (2 * sum(Y * T) + smooth) / (sum(Y^2) + sum(T^2) + smooth)
    
    properties
        Smooth = 1.0;
    end
    
    methods
        function layer = DiceLossLayer(name, smooth)
            if nargin < 1, name = 'dice_loss'; end
            if nargin < 2, smooth = 1.0; end
            
            layer.Name = name;
            layer.Description = 'Soft Dice Loss for Imbalanced Segmentation';
            layer.Smooth = smooth;
        end
        
        function loss = forwardLoss(layer, Y, T)
            % Forward loss calculation
            % Y: Predictions from final sigmoid layer
            % T: Ground truth binary masks
            
            intersection = sum(Y .* T, 'all');
            sum_y = sum(Y.^2, 'all');
            sum_t = sum(T.^2, 'all');
            
            dice = (2.0 * intersection + layer.Smooth) / (sum_y + sum_t + layer.Smooth);
            loss = 1.0 - dice;
        end
    end
end
